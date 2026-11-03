const {spawnSync}=require('child_process'),path=require('path');
const root=path.join(__dirname,'..');
for(const f of ['tests/site.cjs','tests/sql/check_engine.cjs','tests/sql/check_worker.cjs','tests/sql/check_ui.cjs','tests/bigdata/check.cjs','tests/bigdata/check_colors.cjs','tests/bigdata/check_mixed.cjs']){
 console.log('\n> '+f);const r=spawnSync(process.execPath,[f],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
