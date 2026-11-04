// Isolated integration test. No production credentials or email delivery.
import {mkdtemp,cp,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const folder=await mkdtemp(join(tmpdir(),'mojerenta-auth-')),site=join(folder,'site');
const port=19080+Math.floor(Math.random()*400),base='http://127.0.0.1:'+port,router=join(folder,'router.php');
let server,checks=0;const ok=(condition,message)=>{assert.ok(condition,message);checks++};
const profile={first_name:'Test',last_name:'Uživatel',email:'verify-test@example.invalid',phone:'+420 777 123 456',company:'',ico:'',dic:'',address:''};
const password='SecurePass123';
class Client{
 cookie='';csrf='';
 async request(path='/',params){
  const headers={};
  if(this.cookie)headers.cookie=this.cookie;
  if(params){headers['content-type']='application/x-www-form-urlencoded';headers.origin=base;}
  const response=await fetch(base+path,{redirect:'manual',method:params?'POST':'GET',headers,body:params?new URLSearchParams({csrf:this.csrf,...params}):undefined});
  const set=response.headers.get('set-cookie');if(set)this.cookie=set.split(';')[0];
  const body=await response.text(),m=body.match(/name="csrf"\s+value="([a-f0-9]{64})"/);
  if(m)this.csrf=m[1];
  return {status:response.status,redirect:response.headers.get('location'),body};
 }
}
async function outbox(){const raw=await readFile(join(folder,'var','moje-renta-accounts','test-outbox.jsonl'),'utf8');return raw.trim().split('\n').filter(Boolean).map(JSON.parse);}
async function token(purpose){const letter=(await outbox()).filter(m=>m.purpose===purpose).at(-1);ok(!!letter,'Missing '+purpose+' mail');return new URL(letter.url).hash.substring(7);}
try{
 await cp(new URL('./',import.meta.url),site,{recursive:true,filter:x=>!x.includes('/.git')&&!x.includes('/node_modules')});
 await writeFile(router,[
  '<?php',
  "$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);",
  "if($path==='/'||$path==='/index.html'){require __DIR__.'/site/index.php';return true;}",
  "if(str_starts_with($path,'/auth/')){http_response_code(403);return true;}",
  'return false;'
 ].join('\n'));
 server=spawn(process.env.PHP_BINARY||'php',['-S','127.0.0.1:'+port,'-t',site,router],{cwd:folder,env:{...process.env,MOJERENTA_TEST_MODE:'1'},stdio:'pipe'});
 let errorLog='';server.stderr.on('data',x=>errorLog+=x.toString());
 const guest=new Client(),other=new Client();
 let ready=false;for(let i=0;i<80;i++){try{await guest.request('/account.php?view=login');ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}
 ok(ready,'Server not started: '+errorLog);
 const home=await guest.request('/');
 ok(home.status===303&&home.redirect?.includes('/account.php?view=login'),'Guest root should redirect to login');
 ok((await guest.request('/index.html')).status===303,'Legacy index URL must be gated');
 ok((await guest.request('/auth/bootstrap.php')).status===403,'Bootstrap must not be public');
 ok((await guest.request('/app.view.php')).status===403,'Template must not render directly');
 const register=await guest.request('/account.php?view=register');
 ok(register.status===200&&register.body.includes('Registrace')&&register.body.includes('name="password"'),'Registration page missing');
 ok(register.body.includes('name="phone"')&&register.body.includes('name="privacy"'),'Phone or privacy confirmation missing');
 const registration=await guest.request('/account.php?view=register',{action:'register',...profile,password,password_confirm:password,privacy:'yes'});
 ok(registration.status===303,'Registration should redirect after email');
 const mail=await outbox();
 ok(mail.some(m=>m.purpose==='verify')&&mail.some(m=>m.purpose==='admin-registration'),'Verification and operator notification missing');
 ok(!JSON.stringify(mail).includes(password),'Password must not occur in mail');
 const failed=await guest.request('/account.php?view=login',{action:'login',email:profile.email,password});
 ok(failed.status===200&&!failed.redirect,'Login before verification must fail');
 const verify=await token('verify');await guest.request('/account.php?view=verify');
 const verified=await guest.request('/account.php?view=verify',{action:'verify',token:verify});
 ok(verified.status===303&&verified.redirect==='/','Verification should redirect to app');
 const inside=await guest.request('/');
 ok(inside.status===200&&inside.body.includes('Moje renta')&&inside.body.includes('Odhlásit se'),'Approved account needs app and logout');
 ok(inside.body.includes('src="/app.js')&&!inside.body.includes('function rentSim('),'App JS must be external');
 ok((await other.request('/')).status===303,'Session isolation');
 const logout=await guest.request('/account.php?view=login',{action:'logout'});
 ok(logout.status===303,'Logout must redirect');
 ok((await guest.request('/')).status===303,'Logged-out users must be denied');
 await guest.request('/account.php?view=forgot');
 const forgot=await guest.request('/account.php?view=forgot',{action:'forgot',email:profile.email});
 ok(forgot.status===303,'Password recovery request');
 const reset=await token('reset');await guest.request('/account.php?view=reset');
 const nextPassword='NewSecurePass456';
 const resetResponse=await guest.request('/account.php?view=reset',{action:'reset',token:reset,password:nextPassword,password_confirm:nextPassword});
 ok(resetResponse.status===303,'Reset token should change password');
 await guest.request('/account.php?view=login');
 ok((await guest.request('/account.php?view=login',{action:'login',email:profile.email,password:nextPassword})).status===303,'New password must allow login');
 ok((await guest.request('/')).status===200,'Restored account should access app');
 const db=await readFile(join(folder,'var','moje-renta-accounts','accounts.sqlite'));
 ok(!db.includes(Buffer.from(nextPassword))&&!db.includes(Buffer.from(password)),'Plaintext password in SQLite');
 ok((await other.request('/admin.php')).status===403,'Admin area must be protected');
 ok((await guest.request('/account.php?view=privacy')).status===200,'Privacy notice must be available');
 console.log('Moje renta auth integration checks passed: '+checks);
}catch(err){console.error(err);process.exitCode=1}
finally{if(server)server.kill('SIGTERM');await rm(folder,{recursive:true,force:true})}
