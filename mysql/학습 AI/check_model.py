"""Real local-model smoke checks; execute SELECT only in a disposable SQLite fixture."""
import json
import sqlite3
import time
from pathlib import Path
import local_ai_core as core

db = sqlite3.connect(':memory:')
db.executescript('CREATE TABLE products(product_id INT, name TEXT, category TEXT, price INT, stock INT, added_on TEXT); CREATE TABLE customers(customer_id INT, customer_name TEXT, city TEXT);')
db.executemany('INSERT INTO products VALUES(?,?,?,?,?,?)',[
    (1,'마우스','전자',18000,12,'2026-10-01'),(2,'키보드','전자',55000,5,'2026-10-02'),
    (3,'노트','문구',3000,30,'2026-10-03'),(4,'선물',None,1000,None,'2026-10-04')])
db.executemany('INSERT INTO customers VALUES(?,?,?)',[(1,'김민수','서울'),(2,'이수진','부산')])
cases = [
    ('가격이 10000원 이상인 상품의 이름과 가격을 비싼 순서로 보여줘', '', [('키보드',55000),('마우스',18000)], True),
    ('분류별 상품 수를 category, COUNT(*) 순서로 조회해줘', '', [(None,1),('문구',1),('전자',2)], False),
    ('stock이 NULL인 상품의 name만 조회해줘', '', [('선물',)], True),
    ('서울에 사는 고객의 이름만 조회해줘', 'CREATE TABLE customers (customer_id INT PRIMARY KEY, customer_name VARCHAR(50), city VARCHAR(30));', [('김민수',)], True),
]
results = []
for prompt, schema, expected, ordered in cases:
    start = time.monotonic()
    sql, source = core.generate(prompt, schema=schema)
    def authorize(action, *args):
        return sqlite3.SQLITE_OK if action in (sqlite3.SQLITE_SELECT,sqlite3.SQLITE_READ,sqlite3.SQLITE_FUNCTION) else sqlite3.SQLITE_DENY
    db.set_authorizer(authorize)
    rows = db.execute(sql).fetchall()
    ok = rows == expected if ordered else sorted(map(repr,rows)) == sorted(map(repr,expected))
    row = {'request':prompt,'sql':sql,'ok':ok,'seconds':round(time.monotonic()-start,2),'source':source}
    results.append(row)
    print(json.dumps(row,ensure_ascii=False),flush=True)
    if not ok:
        raise AssertionError((prompt,rows,expected))
(core.ROOT/'model-check-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
