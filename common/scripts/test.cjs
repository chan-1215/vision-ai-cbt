const {spawnSync}=require('child_process'),path=require('path');
const root=path.join(__dirname,'../..');
for(const f of ['common/tests/site.cjs','mysql/tests/check_engine.cjs','mysql/tests/check_worker.cjs','mysql/tests/check_ui.cjs','bigdata/tests/check.cjs','bigdata/tests/check_colors.cjs','bigdata/tests/check_mixed.cjs']){
 console.log('\n> '+f);const r=spawnSync(process.execPath,[f],{cwd:root,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
