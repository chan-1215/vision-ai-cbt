const fs=require('fs'),assert=require('assert');
require('../src/engine.js');require('../src/mysql-compat.js');require('../src/content.js');
async function main(){
 const SQL=await require('sql.js')(),{Parser}=require('node-sql-parser/build/mysql');
 let state=null;const checkpoints=[null];
 for(const step of COURSE.steps){
  const r=DBLab.grade(SQL,Parser,state,step,step.answer);
  assert(r.pass,step.id+': '+r.message);
  state=r.state;checkpoints.push(state);
 }
 console.log('PASS reference chain:',COURSE.steps.length,'steps');
 const s=new DBLab.Session(SQL,Parser,checkpoints[8]);
 for(const query of [
 "SELECT name, category, COUNT(*) FROM products GROUP BY category",
 "SELECT name AS 상품명, price AS 가격 FROM products WHERE 가격 > 1000",
 "INSERT INTO products(name,price) VALUES('bad', 'oops')",
 "INSERT INTO products(name,price,added_on) VALUES('bad',1,'2026-02-30')",
 "INSERT INTO products(name,price) VALUES('"+'x'.repeat(51)+"',1)",
 ]){
  const r=s.run(query);assert(r.error,'should fail '+query);
 }
 assert.equal(s.run('SELECT COUNT(*) FROM products').outputs[0].result.values[0][0],12);
 assert(!s.run('SELECT category AS 분류, COUNT(*) AS n FROM products GROUP BY 분류').error);
 assert(!s.run('SELECT category, COUNT(*) AS n FROM products GROUP BY 1').error);
 assert(!DBLab.grade(SQL,Parser,checkpoints[3],COURSE.steps[3],COURSE.steps[3].answer.replace('category VARCHAR(20)','category VARCHAR(20) UNIQUE')).pass);
 const q=COURSE.steps[21];
 assert.equal(DBLab.grade(SQL,Parser,checkpoints[21],q,"SELECT name, price FROM products WHERE price >= 5000 AND price <= 20000;").tone,'missing');
 assert.equal(DBLab.grade(SQL,Parser,checkpoints[21],q,"select name, price from products where price between 5000 and 20000; -- ok").tone,'correct');
 assert.equal(DBLab.grade(SQL,Parser,checkpoints[21],q,"SELECT name, price FROM products WHERE price BETWEEN 20000 AND 5000;").tone,'wrong');
 assert.equal(DBLab.grade(SQL,Parser,checkpoints[21],q,"SELECT p.name, p.price FROM products p WHERE p.price BETWEEN 5000 AND 20000;").tone,'alternative');
 const rows=s.run("SELECT name FROM products WHERE name='semi;colon'; SELECT 1 AS ok;");assert(!rows.error);assert.equal(rows.outputs.length,2);
 s.close();
 fs.writeFileSync(__dirname+'/checkpoints.json',JSON.stringify(checkpoints));
 console.log('PASS strict types, MySQL alias/group checks, four verdicts, comment/string parsing');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
