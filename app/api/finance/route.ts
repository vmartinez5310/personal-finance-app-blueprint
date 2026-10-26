import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { collections, emptyData, validate, installments } from '../../../lib/finance';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function context(){const user=await getChatGPTUser();if(!user)throw new Error('AUTH');return {owner:user.userId,db:env.DB!};}
async function read(db:D1Database,owner:string){const result=await db.prepare('SELECT collection, body FROM finance_records WHERE owner=?').bind(owner).all<{collection:string,body:string}>();const d=emptyData();for(const r of result.results)if(d[r.collection])d[r.collection].push(JSON.parse(r.body));return d;}
function failure(e:unknown){const m=e instanceof Error?e.message:'Error';return json({error:m==='AUTH'?'Inicia sesión para continuar':m},m==='AUTH'?401:422)}
export async function GET(){try{const {owner,db}=await context();return json(await read(db,owner))}catch(e){return failure(e)}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origen inválido'},403);
 const {owner,db}=await context();const raw=await req.text();if(raw.length>10000)return json({error:'Solicitud demasiado grande'},413);const {collection,record,action}=JSON.parse(raw);const data=await read(db,owner);
 const put=(c:string,r:any)=>db.prepare('INSERT INTO finance_records(owner,collection,id,body) VALUES(?,?,?,?) ON CONFLICT(owner,collection,id) DO UPDATE SET body=excluded.body').bind(owner,c,r.id,JSON.stringify(r));
 if(action==='msi'){const result=installments(record,data);await db.batch([put('installment_plans',result.plan),...result.transactions.map(t=>put('transactions',t))]);return json(result,201)}
 if(!collections.includes(collection)||collection==='installment_plans')return json({error:'Operación no permitida'},400);
 if(action==='delete'){
  if(collection!=='transactions')throw new Error('Solo se permite eliminar movimientos');
  const tx=data.transactions.find(t=>t.id===record.id);if(!tx)throw new Error('Movimiento no encontrado');if(tx.msi_plan_id)throw new Error('Las cuotas MSI no pueden eliminarse individualmente');
  await db.prepare('DELETE FROM finance_records WHERE owner=? AND collection=? AND id=?').bind(owner,collection,record.id).run();return json({ok:true});
 }
 if(record.id&&!data[collection].some(r=>r.id===record.id)&&collection!=='budgets')throw new Error('Registro no encontrado');
 if(collection==='transactions'&&record.id&&data.transactions.find(t=>t.id===record.id)?.msi_plan_id)throw new Error('Las cuotas MSI no pueden editarse individualmente');
 const r=validate(collection,{...record,id:record.id||crypto.randomUUID()},data);await put(collection,r).run();return json(r,201);
 }catch(e){return failure(e)}}
