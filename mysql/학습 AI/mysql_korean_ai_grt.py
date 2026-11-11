# -*- coding: utf-8 -*-
"""MySQL Workbench 8 Python plugin. All editor access runs on the UI thread."""
import json
import queue
import sys
import threading
import time
from pathlib import Path

import grt
import mforms
from wb import DefineModule, wbinputs

CONFIG = Path(__file__).with_name('mysql_korean_ai_config.json')
ROOT = Path(json.loads(CONFIG.read_text(encoding='utf-8'))['root'])
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
from local_ai_core import generate, request_line, char_index, byte_index, insertion

ModuleInfo = DefineModule(name='KoreanLocalSQLAI', author='Local SQL AI', version='1.0.2')
_timer = None
_watched = None
_pending = None
_results = queue.Queue()
_candidate = None
_since = 0
_last = None
_schema = {}  # Per connection and default schema, never shared across databases.


def ensure_menu_group():
    # pluginMenu names an existing group; Workbench does not create custom
    # groups automatically. Without this, commands load but never appear.
    registry = grt.root.wb.registry
    group = next((g for g in registry.pluginGroups if g.name == 'Menu/SQL AI'), None)
    if group is None:
        group = grt.classes.app_PluginGroup()
        group.name = 'Menu/SQL AI'
        group.category = 'SQLEditor'
        group.accessibilityName = 'SQL AI'
        registry.pluginGroups.append(group)
    # Also supports installing the group into an already running session.
    linked = {p.name for p in group.plugins}
    for plugin in registry.plugins:
        if plugin.name.startswith('local.sqlai.') and plugin.name not in linked:
            group.plugins.append(plugin)
            linked.add(plugin.name)
    return group


def parent(editor):
    for conn in grt.root.wb.sqlEditors:
        if any(q == editor for q in conn.queryEditors):
            return conn
    return None


def schema_key(conn):
    return (str(conn.__id__), str(conn.defaultSchema))


def log(editor, text):
    message = '[한글 SQL AI] ' + text
    conn = parent(editor) if editor else None
    if conn:
        try:
            conn.addToOutput(message, 0)
            return
        except Exception:
            # Workbench 8.0.47 on Windows exposes this method but raises
            # SystemError("bad function call"). Logging must not stop a job.
            pass
    grt.send_info(message)
    try:
        mforms.App.get().set_status_text(message)
    except Exception:
        pass


def ensure_timer():
    global _timer
    if _timer is None:
        _timer = mforms.Utilities.add_timeout(0.35, tick)


def launch(editor, automatic=False):
    global _pending, _last
    if _pending:
        if not automatic:
            log(editor, '생성 중입니다. 잠시 기다려 주세요.')
        return
    snapshot = str(editor.script)
    caret = int(editor.insertionPoint)
    found = request_line(snapshot, char_index(snapshot, caret), automatic)
    if not found:
        if not automatic:
            mforms.Utilities.show_message('한글 SQL AI', '#가격이 10000원 이상인 상품 조회\n처럼 한 줄에 요청을 쓰고, 그 줄 또는 바로 다음 빈 줄에 커서를 두세요.', '확인', '', '')
        return
    prompt, end = found
    conn = parent(editor)
    key = schema_key(conn) if conn else None
    schema = _schema.get(key, '')
    context = snapshot[:snapshot.rfind('\n', 0, end) + 1]
    job = {'editor':editor, 'text':snapshot, 'caret':caret, 'end':end, 'schema_key':key}
    _pending = job
    _last = (str(editor.__id__), snapshot)
    log(editor, 'SQL 생성 중 · 이 PC에서 처리합니다…')
    ensure_timer()
    def work():
        try:
            sql, source = generate(prompt, context, schema)
            _results.put((job, sql, source, None))
        except Exception as exc:
            _results.put((job, '', '', str(exc)))
    threading.Thread(target=work, daemon=True).start()


def apply_result(job, sql, source):
    editor = job['editor']
    conn = parent(editor)
    if not conn or conn.activeQueryEditor != editor:
        log(editor, '탭이 바뀌어 응답 삽입을 취소했습니다. 다시 생성해 주세요.')
        return
    if (str(editor.script) != job['text'] or int(editor.insertionPoint) != job['caret']
            or schema_key(conn) != job['schema_key']):
        log(editor, '내용·커서·DB가 바뀌어 응답 삽입을 취소했습니다. 다시 생성해 주세요.')
        return
    position, addition = insertion(job['text'], job['end'], sql)
    offset = byte_index(job['text'], position)
    editor.insertionPoint = offset
    editor.replaceSelection(addition)
    editor.insertionPoint = offset + len(addition.encode('utf-8'))
    log(editor, 'SQL 삽입 완료 (' + source + '). 확인 후 실행하세요. Ctrl+Z로 삽입을 취소할 수 있습니다.')


def tick():
    global _pending, _candidate, _since, _watched
    try:
        while not _results.empty():
            job, sql, source, error = _results.get_nowait()
            if job is _pending:
                _pending = None
                if error:
                    log(job['editor'], error)
                    mforms.Utilities.show_error('한글 SQL AI', error, '확인', '', '')
                else:
                    apply_result(job, sql, source)
        if _watched and not _pending:
            conn = parent(_watched)
            # Auto mode is scoped to the tab where it was enabled.
            if not conn or conn.activeQueryEditor != _watched:
                _candidate = None
                return True
            text = str(_watched.script)
            caret = int(_watched.insertionPoint)
            candidate = (str(_watched.__id__), text, caret)
            found = request_line(text, char_index(text, caret), True)
            if found and _last != candidate[:2]:
                if candidate != _candidate:
                    _candidate, _since = candidate, time.monotonic()
                elif time.monotonic() - _since >= 0.8:
                    launch(_watched, True)
            else:
                _candidate = None
    except Exception as exc:
        # Closing a tab invalidates its GRT object. Stop watching it.
        _watched = None
        _candidate = None
        print('[KoreanLocalSQLAI] ' + str(exc))
    return True


@ModuleInfo.plugin('local.sqlai.generate', caption='한글 요청 → SQL 생성', input=[wbinputs.currentQueryEditor()], pluginMenu='SQL AI')
@ModuleInfo.export(grt.INT, grt.classes.db_query_QueryEditor)
def generateSQL(editor):
    launch(editor)
    return 0


@ModuleInfo.plugin('local.sqlai.auto', caption='이 탭에서 자동 생성 켜기 / 끄기', input=[wbinputs.currentQueryEditor()], pluginMenu='SQL AI')
@ModuleInfo.export(grt.INT, grt.classes.db_query_QueryEditor)
def toggleAuto(editor):
    global _watched, _candidate, _last
    _watched = None if _watched == editor else editor
    _candidate = _last = None
    ensure_timer()
    message = '자동 생성 켜짐. 이 탭에서 #한글 요청을 쓰고 Enter를 누르세요.' if _watched else '자동 생성 꺼짐.'
    log(editor, message)
    mforms.Utilities.show_message('한글 SQL AI', message, '확인', '', '')
    return 0


@ModuleInfo.plugin('local.sqlai.schema', caption='현재 DB 테이블 구조 읽기', input=[wbinputs.currentSQLEditor()], pluginMenu='SQL AI')
@ModuleInfo.export(grt.INT, grt.classes.db_query_Editor)
def readSchema(conn):
    try:
        name = str(conn.defaultSchema)
        if not name or not conn.isConnected:
            raise ValueError('먼저 DB에 연결하고 왼쪽 SCHEMAS에서 사용할 DB를 더블클릭해 주세요.')
        # Hex avoids SQL-mode-dependent string quoting. Only schema metadata is read.
        literal = "CONVERT(0x%s USING utf8mb4)" % name.encode('utf-8').hex()
        result = conn.executeManagementQuery(
            'SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY FROM information_schema.COLUMNS '
            'WHERE TABLE_SCHEMA = ' + literal + ' ORDER BY TABLE_NAME, ORDINAL_POSITION LIMIT 500', 0)
        tables = {}
        if result and result.goToFirstRow():
            while True:
                table = str(result.stringFieldValue(0))
                col = str(result.stringFieldValue(1))
                typ = str(result.stringFieldValue(2))
                key = str(result.stringFieldValue(3))
                tables.setdefault(table, []).append('`' + col.replace('`', '``') + '` ' + typ + (' PRIMARY KEY' if key == 'PRI' else ''))
                if not result.nextRow():
                    break
        if not tables:
            raise ValueError('현재 DB에 읽을 수 있는 테이블이 없습니다.')
        schema = '\n'.join('TABLE `' + name.replace('`','``') + '`.`' + table.replace('`','``') + '` (' + ', '.join(columns) + ')' for table, columns in tables.items())
        _schema[schema_key(conn)] = schema
        mforms.Utilities.show_message('한글 SQL AI', name + ': ' + str(len(tables)) + '개 테이블 구조를 읽었습니다.\n테이블의 실제 행 데이터는 읽지 않습니다. 구조 변경 후 이 메뉴를 다시 실행하세요.\n최대 500개 열, AI 입력은 16,000자까지 사용합니다.', '확인', '', '')
    except Exception as exc:
        mforms.Utilities.show_error('한글 SQL AI', str(exc), '확인', '', '')
    return 0


@ModuleInfo.export(grt.INT)
def initialize():
    # Workbench invokes initialize after its built-in registry is ready,
    # before opening the initial SQL connection and building its menus.
    ensure_menu_group()
    return 0
