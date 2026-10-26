import { cents, decimal } from './money';
export { cents, decimal };
export type Row = Record<string, any>;
export type Data = Record<string, Row[]>;
export const collections = ['accounts','categories','credit_cards','transactions','budgets','savings_goals','loans','installment_plans'];
export const emptyData = (): Data => Object.fromEntries(collections.map(k=>[k,[]]));
export const today = () => new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
export function addMonths(date:string, n:number) {
 const [y,m,d]=date.split('-').map(Number), t=new Date(Date.UTC(y,m-1+n,1));
 return `${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,'0')}-${String(Math.min(d,new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate())).padStart(2,'0')}`;
}
export function balance(a:Row,tx:Row[],asOf=today()) {
 return tx.filter(t=>t.date<=asOf && !['void','cancelled'].includes(t.status)).reduce((s,t)=>s+(t.destination_account_id===a.id?cents(t.amount):0n)-(t.source_account_id===a.id?cents(t.amount):0n),cents(a.initial_balance));
}
export function cardDebt(c:Row,tx:Row[]) {
 return tx.filter(t=>t.card_id===c.id && (t.msi_plan_id || t.date<=today()) && !['void','cancelled'].includes(t.status)).reduce((s,t)=>s+(t.type==='cc_payment'?-cents(t.amount):cents(t.amount)),0n);
}
export function totals(data:Data,period:string) {
 const tx=data.transactions.filter(t=>t.date.startsWith(period)&&!['void','cancelled'].includes(t.status));
 const sum=(type:string)=>tx.filter(t=>t.type===type).reduce((s,t)=>s+cents(t.amount),0n);
 const available=data.accounts.filter(a=>['checking','cash'].includes(a.type)).reduce((s,a)=>s+balance(a,data.transactions),0n);
 const savings=data.accounts.filter(a=>['savings','investment'].includes(a.type)).reduce((s,a)=>s+balance(a,data.transactions),0n);
 const vouchers=data.accounts.filter(a=>a.type==='food_vouchers').reduce((s,a)=>s+balance(a,data.transactions),0n);
 const assets=data.accounts.reduce((s,a)=>s+balance(a,data.transactions),0n);
 const debt=data.credit_cards.reduce((s,c)=>s+cardDebt(c,data.transactions),0n)+data.loans.reduce((s,l)=>s+cents(l.principal_amount),0n);
 const budget=data.budgets.filter(b=>b.period===period).reduce((s,b)=>s+cents(b.budgeted_amount),0n);
 return {income:sum('income'),expense:sum('expense'),available,savings,vouchers,assets,debt,net:assets-debt,budget};
}
export function validate(collection:string, input:Row, data:Data):Row {
 const r={...input}; delete r.owner;
 const fail=(s:string):never=>{throw new Error(s)};
 const money=(key:string,positive=false)=>{const v=String(r[key]??'0'); const n=cents(v); if(n<0n||(positive&&n===0n)||n>99999999999999n)fail('Importe fuera de rango'); r[key]=decimal(n);};
 const name=()=>{if(typeof r.name!=='string'||!r.name.trim()||r.name.length>100)fail('Escribe un nombre de hasta 100 caracteres');r.name=r.name.trim()};
 const date=(key:string)=>{if(typeof r[key]!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r[key])||isNaN(Date.parse(r[key]))||new Date(r[key]).toISOString().slice(0,10)!==r[key])fail('Fecha inválida')};
 const ref=(table:string,key:string,required=false)=>{if(required&&!r[key])fail('Selecciona '+key);if(r[key]&&!data[table].some(x=>x.id===r[key]))fail('Referencia no encontrada: '+key)};
 if(collection==='accounts'){name();money('initial_balance');if(!['checking','savings','investment','cash','food_vouchers'].includes(r.type))fail('Tipo de cuenta inválido');r.currency='MXN';r.is_active=true;}
 if(collection==='categories'){name();if(!['income','expense'].includes(r.type))fail('Tipo inválido')}
 if(collection==='credit_cards'){name();money('credit_limit',true);for(const k of ['cutoff_day','payment_day']){r[k]=Number(r[k]);if(!Number.isInteger(r[k])||r[k]<1||r[k]>31)fail('Día inválido')}r.is_active=true;}
 if(collection==='savings_goals'){name();money('target_amount',true);ref('accounts','account_id',true);if(r.target_date)date('target_date')}
 if(collection==='loans'){name();money('principal_amount',true);money('monthly_amount');r.status='active';}
 if(collection==='budgets'){money('budgeted_amount');if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(r.period))fail('Periodo inválido');ref('categories','category_id',true);if(data.categories.find(c=>c.id===r.category_id)?.type!=='expense')fail('El presupuesto requiere una categoría de gasto');r.id=`${r.period}:${r.category_id}`;}
 if(collection==='transactions'){
  money('amount',true);date('date');r.status=r.date>today()?'pending':'cleared';
  if(!['income','expense','transfer','cc_payment'].includes(r.type))fail('Tipo inválido');
  for(const k of ['source_account_id','destination_account_id'])ref('accounts',k);ref('credit_cards','card_id');ref('categories','category_id');
  if(r.type==='income'&&(!r.destination_account_id||r.source_account_id||r.card_id))fail('Selecciona únicamente la cuenta destino');
  if(r.type==='expense'&&((!!r.source_account_id===!!r.card_id)||r.destination_account_id))fail('Selecciona una cuenta o una tarjeta para el gasto');
  if(r.type==='transfer'&&(!r.source_account_id||!r.destination_account_id||r.source_account_id===r.destination_account_id||r.card_id))fail('Las cuentas deben ser distintas');
  if(r.type==='cc_payment'&&(!r.source_account_id||!r.card_id||r.destination_account_id))fail('Selecciona cuenta y tarjeta para el pago');
  if(r.category_id&&['income','expense'].includes(r.type)&&data.categories.find(c=>c.id===r.category_id)?.type!==r.type)fail('La categoría no corresponde al tipo');
  if(r.description&&String(r.description).length>300)fail('Descripción demasiado larga');
 }
 return r;
}
export function installments(input:Row,data:Data){
 const total=cents(String(input.total_amount));const n=Number(input.installments_total);
 if(!Number.isInteger(n)||n<2||n>60||total<BigInt(n)||total>99999999999999n)throw new Error('Monto o plazo MSI inválido (2–60 meses)');
 const probe=validate('transactions',{type:'expense',amount:decimal(total),date:input.purchase_date,card_id:input.card_id,category_id:input.category_id,description:input.description},data);
 const plan={...input,id:crypto.randomUUID(),total_amount:decimal(total),monthly_amount:decimal(total/BigInt(n)),installments_total:n,status:'active'};
 const tx=Array.from({length:n},(_,i)=>({...probe,id:crypto.randomUUID(),msi_plan_id:plan.id,date:addMonths(input.purchase_date,i+1),status:'pending',amount:decimal(i===n-1?total-(total/BigInt(n))*BigInt(n-1):total/BigInt(n)),description:`${input.description||'Compra MSI'} (${i+1}/${n})`}));
 return {plan,transactions:tx};
}
