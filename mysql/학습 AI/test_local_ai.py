import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch
import local_ai_core as core


class CoreTests(unittest.TestCase):
    def test_korean_byte_offsets(self):
        text = "SELECT '한글😀';\n#상품 조회\n"
        caret = core.char_index(text, len(text.encode('utf8')))
        self.assertEqual(caret, len(text))
        self.assertEqual(core.request_line(text, caret, True)[0], '상품 조회')

    def test_requires_enter_in_automatic_mode(self):
        text = '#전체 상품 조회'
        self.assertIsNone(core.request_line(text, len(text), True))
        self.assertEqual(core.request_line(text, len(text))[0], '전체 상품 조회')

    def test_not_regular_sql_comment_or_string(self):
        for text in ["SELECT '#상품 조회';\n", "SELECT '줄바꿈\n#상품 조회\n", '/*\n#상품 조회\n', '# english only\n', 'SELECT 1;\n']:
            self.assertIsNone(core.request_line(text, len(text), True), text)

    def test_previous_comments_do_not_hide_request(self):
        for prefix in ['-- 설명\n', '#설명\n', "SELECT '한글';\n", '/* 설명 */\n']:
            text = prefix + '#전체 조회\n'
            self.assertEqual(core.request_line(text, len(text), True)[0], '전체 조회')

    def test_preserves_existing_sql_and_crlf(self):
        text = "SELECT '기존';\r\n#상품 조회\r\n\r\nSELECT 2;"
        caret = text.index('\r\n\r\n') + 2
        prompt, end = core.request_line(text, caret, True)
        offset, addition = core.insertion(text, end, 'SELECT *\nFROM products;')
        result = text[:offset] + addition + text[offset:]
        self.assertEqual(result, "SELECT '기존';\r\n#상품 조회\r\nSELECT *\r\nFROM products;\r\n\r\nSELECT 2;")

    def test_no_newline_at_eof(self):
        text = '#상품 조회'
        _, end = core.request_line(text, len(text))
        offset, addition = core.insertion(text, end, 'SELECT 1;')
        self.assertEqual(text[:offset] + addition + text[offset:], text + '\nSELECT 1;\n')

    def test_sql_cleanup(self):
        self.assertEqual(core.clean_sql('```sql\nSELECT 1;\n```'), 'SELECT 1;')
        self.assertEqual(core.clean_sql('-- 테이블 이름을 알려 주세요.'), '-- 테이블 이름을 알려 주세요.')
        with self.assertRaises(ValueError):
            core.clean_sql('Here is your answer: SELECT 1;')

    def test_all_52_reference_titles(self):
        course = json.loads((core.ROOT/'course.json').read_text(encoding='utf8'))
        self.assertEqual(len(course['steps']), 52)
        for item in course['steps']:
            sql, source = core.generate(item['title'])
            self.assertEqual(sql, item['answer'])
            self.assertEqual(source, '학습 예제')


class FakeEditor:
    def __init__(self, text):
        self.script = text
        self.insertionPoint = len(text.encode('utf8'))
        self.__id__ = 'editor-test'

    def replaceSelection(self, addition):
        idx = core.char_index(self.script, self.insertionPoint)
        self.script = self.script[:idx] + addition + self.script[idx:]


class PluginTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        class Info:
            def plugin(self, *args, **kwargs): return lambda fn: fn
            def export(self, *args, **kwargs): return lambda fn: fn
        wb = types.SimpleNamespace(DefineModule=lambda **kw:Info(), wbinputs=types.SimpleNamespace(currentQueryEditor=lambda:None, currentSQLEditor=lambda:None))
        group_factory = lambda: types.SimpleNamespace(name='', category='', accessibilityName='', plugins=[])
        registry = types.SimpleNamespace(pluginGroups=[], plugins=[])
        grt = types.SimpleNamespace(INT=int, classes=types.SimpleNamespace(db_query_QueryEditor=object, db_query_Editor=object, app_PluginGroup=group_factory), root=types.SimpleNamespace(wb=types.SimpleNamespace(sqlEditors=[], registry=registry)))
        forms = types.SimpleNamespace(Utilities=types.SimpleNamespace(add_timeout=lambda *args:1, show_error=lambda *args:None, show_message=lambda *args:None))
        config = json.dumps({'root':str(core.ROOT)})
        real_read = Path.read_text
        def read(path, *args, **kwargs):
            return config if path.name == 'mysql_korean_ai_config.json' else real_read(path,*args,**kwargs)
        with patch.dict(sys.modules, {'grt':grt, 'mforms':forms, 'wb':wb}), patch.object(Path,'read_text',read):
            spec = importlib.util.spec_from_file_location('plugin_test',core.ROOT/'mysql_korean_ai_grt.py')
            cls.plugin = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(cls.plugin)

    def setUp(self):
        self.editor = FakeEditor('#상품 조회\n')
        self.conn = types.SimpleNamespace(__id__='connection',defaultSchema='store',activeQueryEditor=self.editor,queryEditors=[self.editor],addToOutput=lambda *args:None)
        self.plugin.grt.root.wb.sqlEditors = [self.conn]
        self.job = {'editor':self.editor,'text':self.editor.script,'caret':self.editor.insertionPoint,'end':len(self.editor.script)-1,'schema_key':('connection','store')}

    def test_insert_after_korean_request(self):
        self.plugin.apply_result(self.job, 'SELECT * FROM products;', 'test')
        self.assertEqual(self.editor.script, '#상품 조회\nSELECT * FROM products;\n')

    def test_broken_workbench_output_does_not_abort_generation(self):
        def broken_output(*args):
            raise SystemError('bad function call')
        self.conn.addToOutput = broken_output
        with patch.object(self.plugin.grt, 'send_info', create=True) as fallback:
            self.plugin.apply_result(self.job, 'SELECT * FROM products;', 'test')
        self.assertEqual(self.editor.script, '#상품 조회\nSELECT * FROM products;\n')
        fallback.assert_called_once()

    def test_custom_menu_group_exists_and_links_commands_once(self):
        registry = self.plugin.grt.root.wb.registry
        names = ['local.sqlai.generate', 'local.sqlai.auto', 'local.sqlai.schema']
        with patch.object(registry, 'plugins', [types.SimpleNamespace(name=n) for n in names]):
            self.assertEqual(self.plugin.initialize(), 0)
            group = self.plugin.ensure_menu_group()
            self.assertIs(self.plugin.ensure_menu_group(), group)
        self.assertEqual([p.name for p in group.plugins], names)
        self.assertEqual(group.category, 'SQLEditor')
        self.assertEqual(len([g for g in registry.pluginGroups if g.name == 'Menu/SQL AI']), 1)

    def test_stale_text_not_inserted(self):
        self.editor.script += 'SELECT 2;'
        before = self.editor.script
        self.plugin.apply_result(self.job, 'SELECT 1;', 'test')
        self.assertEqual(self.editor.script,before)

    def test_changed_caret_not_inserted(self):
        self.editor.insertionPoint = 0
        self.plugin.apply_result(self.job, 'SELECT 1;', 'test')
        self.assertEqual(self.editor.script,self.job['text'])

    def test_changed_database_not_inserted(self):
        self.conn.defaultSchema = 'different'
        self.plugin.apply_result(self.job, 'SELECT 1;', 'test')
        self.assertEqual(self.editor.script,self.job['text'])

    def test_changed_tab_not_inserted(self):
        self.conn.activeQueryEditor = None
        self.plugin.apply_result(self.job, 'SELECT 1;', 'test')
        self.assertEqual(self.editor.script,self.job['text'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
