import 'dotenv/config';
import EmbeddedPostgres from 'embedded-postgres';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import pg from 'pg';

const root=process.cwd();
const DB_NAME='luxury_real_estate';
const port=Number(process.env.DB_PORT||5432);
const user=process.env.DB_USER||'postgres';
const password=process.env.DB_PASSWORD||'postgres';

function isPortOpen(p:number):Promise<boolean>{return new Promise(res=>{const s=net.connect({host:'127.0.0.1',port:p});s.setTimeout(800);s.once('connect',()=>{s.destroy();res(true)});s.once('timeout',()=>{s.destroy();res(false)});s.once('error',()=>res(false))})}
async function ensureDatabase(){const c=new pg.Client({host:'127.0.0.1',port,user,password,database:'postgres'});await c.connect();const r=await c.query('SELECT 1 FROM pg_database WHERE datname=$1',[DB_NAME]);if(r.rowCount===0){await c.query(`CREATE DATABASE "${DB_NAME}"`);console.log(`[db] created database "${DB_NAME}"`)}await c.end()}
function run(cmd:string,args:string[]){console.log(`[db] $ ${cmd} ${args.join(' ')}`);const r=spawnSync(cmd,args,{cwd:root,stdio:'inherit',shell:true,env:process.env});if(r.status!==0)throw new Error('command failed: '+cmd)}
function ensureEnv(){const envPath=path.join(root,'.env');if(!existsSync(envPath)){const example=path.join(root,'.env.example');writeFileSync(envPath,existsSync(example)?readFileSync(example,'utf8'):'','utf8');console.log('[db] created .env from .env.example')}}

async function main(){
  ensureEnv();
  let started=false;
  if(await isPortOpen(port)){
    console.log(`[db] Postgres already reachable on :${port}`);
  }else{
    const cluster=new EmbeddedPostgres({databaseDir:path.join(root,'.pgdata'),user,password,port,persistent:true,authMethod:'scram-sha-256',initdbFlags:['--encoding=UTF8','--locale=C']});
    if(!existsSync(path.join(root,'.pgdata','PG_VERSION'))){console.log('[db] initialising cluster (first run can take a moment)…');await cluster.initialise()}
    console.log('[db] starting Postgres…');await cluster.start();started=true;
  }
  await ensureDatabase();
  run('npx',['prisma','migrate','deploy','--schema','server/prisma/schema.prisma']);
  run('npm',['run','db:seed']);
  console.log(`[db] ready — Postgres listening on :${port}, database seeded.`);
  if(started){process.on('SIGINT',()=>process.exit(0));process.on('SIGTERM',()=>process.exit(0));await new Promise(()=>{})}
}
main().catch(e=>{console.error('[db] failed:',e);process.exit(1)})