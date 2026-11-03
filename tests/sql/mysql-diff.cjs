const fs=require('fs'),crypto=require('crypto'),mysql=require('mysql2/promise');
require('../../src/sql/engine.js');require('../../src/sql/mysql-compat.js');require('../../src/sql/content.js');
const numTypes=new Set([0,1,2,3,4,5,8,9,13,16,246]);
function normalize(rows,fields){return rows.map(r=>r.map((v,i)=>v!==null&&numTypes.has(fields?.[i]?.columnType)?Math.round(Number(v)*1e7)/1e7:v));}
const canonical=rows=>JSON.stringify(rows);
async function main(){
 if(process.env.CBT_DISPOSABLE_MYSQL!=='YES')throw Error('Use a disposable local MySQL 8.0.46 instance on port 33079. This test drops store_lab and compat_diff. Set CBT_DISPOSABLE_MYSQL=YES only for that instance.');
 const c=await mysql.createConnection({host:'127.0.0.1',port:33079,user:process.env.CBT_MYSQL_USER||'root',password:process.env.CBT_MYSQL_PASSWORD||'',rowsAsArray:true,dateStrings:true,flags:'-FOUND_ROWS'});
 await c.query('SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci');
 await c.query('DROP DATABASE IF EXISTS store_lab');await c.query('DROP DATABASE IF EXISTS compat_diff');
 const SQL=await require('sql.js')(),{Parser}=require('node-sql-parser/build/mysql'),s=new DBLab.Session(SQL,Parser);
 const report=[],failures=[];
 async function compare(sql,label,ordered=true){
  let real,error,fields;
  try{[real,fields]=await c.query(sql);}catch(e){error=e.errno;}
  const got=s.run(sql),actual=got.outputs.at(-1)?.result,code=got.error?Number(got.error.match(/^\d+/)?.[0]||-1):null;
  let ok=error?error===code:!got.error;
  if(ok&&!error&&Array.isArray(real)){
   let expected=normalize(real,fields),values=actual?.values||[];
   if(!ordered){expected=expected.map(r=>JSON.stringify(r)).sort();values=values.map(r=>JSON.stringify(r)).sort();}
   ok=canonical(expected)===canonical(values);
   if(ok&&actual)ok=canonical(fields.map(f=>f.name.replace(/[\s\x60]/g,'')))===canonical(actual.columns.map(f=>f.replace(/[\s\x60]/g,'')));
  }
  const row={label,sql,ok,expectedError:error||null,error:got.error||null};
  if(!ok){row.expected=Array.isArray(real)?normalize(real,fields):real;row.actual=actual;row.columns=fields?.map(f=>f.name);failures.push(row);}
  report.push(row);
  return got;
 }
 for(const q of COURSE.steps){
  for(const st of DBLab.split(q.answer))await compare(st.sql,q.id+' '+q.title,q.ordered||q.kind==='state'||/^DESC/i.test(st.sql));
  if(q.kind==='state'&&s.current&&s.tables().length){
   for(const t of s.tables())await compare('SELECT * FROM '+t+' ORDER BY 1','state '+q.id+' '+t);
  }
 }
 const cases=[
 'CREATE DATABASE compat_diff CHARACTER SET utf8mb4','USE compat_diff',
 'CREATE TABLE text_test(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(30), qty INT, price DECIMAL(8,2), d DATE)',
 "INSERT INTO text_test(name,qty,price,d) VALUES('ABC',1,2.675,'2026-1-2'),('abc',2,3.125,'26-2-3'),('Café',3,4.5,20261027),('CAFE',4,5.0,NULL),('가나다',0,6.5,'2026-10-27'),(NULL,NULL,NULL,NULL),('a ',5,0,NULL)",
 "SELECT name FROM text_test WHERE name='abc' ORDER BY id",
 "SELECT name FROM text_test WHERE name='cafe' ORDER BY id",
 "SELECT name FROM text_test WHERE name LIKE '%A%' ORDER BY id",
 "SELECT name FROM text_test WHERE name LIKE 'caf_' ORDER BY id",
 "SELECT DISTINCT name FROM text_test ORDER BY name",
 "SELECT name,COUNT(*) AS n,SUM(qty) AS total FROM text_test GROUP BY name ORDER BY name",
 "SELECT name FROM text_test ORDER BY name DESC LIMIT 4",
 "SELECT name FROM text_test ORDER BY name LIMIT 2,3",
 "SELECT name FROM text_test WHERE qty='02' ORDER BY id",
 "SELECT name FROM text_test WHERE name IN ('ABC',NULL) ORDER BY id",
 "SELECT name FROM text_test WHERE name NOT IN ('ABC',NULL) ORDER BY id",
 "SELECT name FROM text_test WHERE name BETWEEN 'a' AND 'cafe' ORDER BY id",
 "SELECT name,price FROM text_test WHERE id=999",
 "SELECT COUNT(*) AS n,COUNT(qty) AS q,AVG(qty) AS avgq,MAX(qty) AS maxq,MIN(qty) AS minq,SUM(qty) AS sumq FROM text_test",
 "SELECT COUNT(*) AS n,AVG(qty) AS avgq,SUM(qty) AS sumq FROM text_test WHERE id=999",
 "SELECT 'A'='a' AS x,'é'='e' AS y,'ß'='ss' AS z,'a'='a ' AS space",
 "SELECT 'é' LIKE 'e' AS x,'ß' LIKE 'ss' AS y",
 "SELECT 7/2 AS v,5 DIV 2 AS d,5%2 AS m,'10abc'=10 AS eq",
 "SELECT name AS label FROM text_test WHERE label='ABC'",
 "SELECT name,COUNT(*) FROM text_test GROUP BY qty",
 "SELECT name,COUNT(*) FROM text_test",
 "SELECT name,COUNT(*) AS n FROM text_test WHERE name='ABC'",
 "SELECT id,name,COUNT(*) AS n FROM text_test GROUP BY id ORDER BY id",
 "SELECT name,COUNT(*) AS n FROM text_test GROUP BY name ORDER BY qty",
 "SELECT DISTINCT name FROM text_test ORDER BY qty",
 "SELECT name AS label,COUNT(*) AS n FROM text_test GROUP BY label ORDER BY label",
 "SELECT name,COUNT(*) AS n FROM text_test GROUP BY 1 ORDER BY name",
 "INSERT INTO text_test(name,qty) VALUES('rounded',2.5),('negative',-2.5),('numeric','5.6')",
 "SELECT id,name,qty FROM text_test WHERE id>=8 ORDER BY id",
 "INSERT INTO text_test(name,qty) VALUES('bad','oops')",
 "INSERT INTO text_test(name,qty) VALUES('bad','12abc')",
 "INSERT INTO text_test(name,qty) VALUES('overflow',2147483648)",
 "INSERT INTO text_test(name,d) VALUES('date-bad','2026-02-30')",
 "INSERT INTO text_test(name,price) VALUES('money',2.675)",
 "SELECT name,price FROM text_test WHERE name='money'",
 'CREATE TABLE strict_test(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(4) UNIQUE,x INT NOT NULL,u INT UNSIGNED,flag TINYINT,d DATE)',
 "INSERT INTO strict_test(name,x) VALUES('A',1),('B',2)",
 "INSERT INTO strict_test(name,x) VALUES('a',3)",
 "INSERT INTO strict_test(name,x) VALUES('C',NULL)",
 "INSERT INTO strict_test(name) VALUES('C')",
 "INSERT INTO strict_test(name,x) VALUES('C',3)",
 "INSERT INTO strict_test(id,name,x) VALUES(0,'zero',0)",
 "INSERT INTO strict_test(name,x) VALUES('large',1)",
 "INSERT INTO strict_test(name,x) VALUES('Z   ',1)",
 "INSERT INTO strict_test(name,x,u) VALUES('neg',1,-1)",
 "INSERT INTO strict_test(name,x,flag) VALUES('flag',1,128)",
 "SELECT id,name,x FROM strict_test ORDER BY id",
 "UPDATE strict_test SET x=x+1,u=x WHERE id=1",
 "SELECT id,x,u FROM strict_test WHERE id=1",
 "UPDATE strict_test SET x=x",
 "SET SQL_SAFE_UPDATES=1",
 "UPDATE strict_test SET x=9 WHERE name='B'",
 "UPDATE strict_test SET x=9",
 "UPDATE strict_test SET x=x+1 LIMIT 1",
 "DELETE FROM strict_test LIMIT 1",
 "SET SQL_SAFE_UPDATES=0",
 "SELECT id,name,x FROM strict_test ORDER BY id",
 "DELETE FROM strict_test WHERE name='b'",
 "ALTER TABLE strict_test AUTO_INCREMENT=1",
 "INSERT INTO strict_test(name,x) VALUES('end',1)",
 "SELECT id,name,x FROM strict_test ORDER BY id",
 "DESC strict_test",
 "CREATE TABLE failed_batch(id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(12) UNIQUE)",
 "INSERT INTO failed_batch(name) VALUES('a'),('A'),('b')",
 "INSERT INTO failed_batch(name) VALUES('ok')",
 "SELECT * FROM failed_batch ORDER BY id",
 "CREATE TABLE char_test(id INT PRIMARY KEY,c CHAR(6),v VARCHAR(6))",
 "INSERT INTO char_test VALUES(1,'abc  ','abc  ')",
 "SELECT c,v,CHAR_LENGTH(c) AS lc,CHAR_LENGTH(v) AS lv FROM char_test",
 "SELECT MIN(name) AS min_name,MAX(name) AS max_name FROM text_test",
 "SELECT AVG(price) AS p FROM text_test",
 "SELECT COUNT(DISTINCT name) AS n FROM text_test",
 "SELECT name,COUNT(*) AS n FROM text_test GROUP BY name HAVING n>=2 ORDER BY name",
 "SELECT name,SUM(qty) AS total FROM text_test GROUP BY name ORDER BY total+1 DESC,name",
 "SELECT 2 IS TRUE AS a,0 IS FALSE AS b,NULL IS TRUE AS c,NULL IS NOT TRUE AS d",
 "SELECT 1e-3 AS n,.5 AS half,-1.5e+2 AS negative",
 "SELECT LOWER('CAFÉ') AS lower_name,CHAR_LENGTH('가나다😀') AS chars,LENGTH('가나다😀') AS bytes",
 "SELECT CONCAT('a','b','c') AS s,CONCAT('x',NULL) AS n",
 "SELECT CONCAT_WS(',',NULL,NULL,'a') AS a,CONCAT_WS(',',NULL,'','b') AS b",
 "SELECT CASE WHEN NULL IS NULL THEN 'yes' ELSE 'no' END AS v",
 "SELECT IFNULL(NULL,5) AS n,COALESCE(NULL,NULL,7) AS c",
 "CREATE TABLE defaults_test(id INT AUTO_INCREMENT PRIMARY KEY,n VARCHAR(5) DEFAULT 'hi',qty INT DEFAULT 7)",
 "INSERT INTO defaults_test() VALUES()",
 "SELECT * FROM defaults_test ORDER BY id",
 "CREATE TABLE IF NOT EXISTS defaults_test(id INT,n VARCHAR(1),qty INT)",
 "INSERT INTO defaults_test(n,qty) VALUES('hello',2)",
 "SELECT * FROM defaults_test ORDER BY id",
 "ALTER TABLE defaults_test ADD memo VARCHAR(10)",
 "UPDATE defaults_test SET memo='updated' WHERE id=1",
 "ALTER TABLE defaults_test DROP COLUMN memo",
 "INSERT INTO defaults_test(n,qty) VALUES('bye',3)",
 "SELECT * FROM defaults_test ORDER BY id",
 "SELECT * FROM missing_table",
 "SELECT missing_column FROM text_test",
 "SELECT name, FROM text_test",
 "UPDATE strict_test SET x=1 WHERE id=999",
 "SELECT name FROM text_test WHERE name NOT LIKE '%a%' ORDER BY id",
 "SELECT name FROM text_test WHERE qty NOT BETWEEN 1 AND 3 ORDER BY id",
 "SELECT id FROM text_test WHERE qty IS NULL OR qty=0 ORDER BY id"
 ];
 for(let i=0;i<cases.length;i++)await compare(cases[i],'compat '+(i+1));
 const sourceHash=crypto.createHash('sha256').update(['engine.js','mysql-compat.js','content.js'].map(f=>fs.readFileSync(__dirname+'/../../src/sql/'+f,'utf8')).join('\n')).digest('hex');
 const summary={reference:'MySQL 8.0.46 / strict / utf8mb4_0900_ai_ci',sourceHash,checkedAt:new Date().toISOString(),total:report.length,passed:report.length-failures.length,failures};
 fs.writeFileSync(__dirname+'/../../src/sql/mysql-compat-report.json',JSON.stringify({...summary,tests:report},null,2));
 console.log(JSON.stringify({...summary,failures:failures.map(f=>({label:f.label,sql:f.sql,error:f.error,expectedError:f.expectedError,expected:f.expected,actual:f.actual}))},null,2));s.close();await c.end();if(failures.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
