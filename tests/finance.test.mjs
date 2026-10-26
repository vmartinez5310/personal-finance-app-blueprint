import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import ts from 'typescript';
mkdirSync('.sites-runtime/tests',{recursive:true});
for(const name of ['money','finance']){
 const source=readFileSync(`lib/${name}.ts`,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText.replaceAll('require("./money")','require("./money.cjs")');
 writeFileSync(`.sites-runtime/tests/${name}.cjs`,js);
}
const require=createRequire(import.meta.url);
const {cents,decimal,balance,totals,emptyData,validate,installments,addMonths,cardDebt}=require('../.sites-runtime/tests/finance.cjs');
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS',name)};
const data=emptyData();data.accounts=[{id:'a',initial_balance:'100.00'},{id:'b',initial_balance:'0.00'}];data.categories=[{id:'food',type:'expense'}];data.credit_cards=[{id:'c',credit_limit:'1000.00'}];
test('decimal cents remain exact',()=>{assert.equal(cents('0.10')+cents('0.20'),30n);assert.equal(decimal(-101n),'-1.01');assert.throws(()=>cents('1.001'))});
test('transfer preserves assets and never inflates spending',()=>{const t=validate('transactions',{type:'transfer',amount:'20.01',date:'2026-01-01',source_account_id:'a',destination_account_id:'b'},data);data.transactions=[t];assert.equal(balance(data.accounts[0],data.transactions),7999n);assert.equal(balance(data.accounts[1],data.transactions),2001n);assert.equal(totals(data,'2026-01').expense,0n)});
test('transfer to same account rejected',()=>assert.throws(()=>validate('transactions',{type:'transfer',amount:'2',date:'2026-01-01',source_account_id:'a',destination_account_id:'a'},data)));
test('unknown reference rejected',()=>assert.throws(()=>validate('transactions',{type:'expense',amount:'2',date:'2026-01-01',source_account_id:'stranger'},data)));
test('negative and fractional cents rejected',()=>{for(const amount of ['-1','0','1.001'])assert.throws(()=>validate('transactions',{type:'expense',amount,date:'2026-01-01',source_account_id:'a'},data))});
test('invalid dates rejected',()=>assert.throws(()=>validate('transactions',{type:'income',amount:'2',date:'2026-02-30',destination_account_id:'a'},data)));
test('month-end rollover clamps dates',()=>{assert.equal(addMonths('2026-01-31',1),'2026-02-28');assert.equal(addMonths('2024-01-31',1),'2024-02-29')});
test('MSI remainder and committed credit exact',()=>{const result=installments({total_amount:'100.00',installments_total:3,purchase_date:'2026-01-31',card_id:'c',description:'Test'},data);assert.deepEqual(result.transactions.map(t=>t.amount),['33.33','33.33','33.34']);assert.equal(result.transactions[0].date,'2026-02-28');assert.equal(cardDebt(data.credit_cards[0],result.transactions),10000n)});
test('budget identity stable for month and category',()=>{assert.equal(validate('budgets',{period:'2026-01',category_id:'food',budgeted_amount:'100'},data).id,'2026-01:food')});
test('card payment reduces debt but is not an expense',()=>{data.transactions=[{card_id:'c',type:'expense',amount:'40.00',date:'2026-01-01'},{card_id:'c',type:'cc_payment',source_account_id:'a',amount:'15.00',date:'2026-01-02'}];assert.equal(cardDebt(data.credit_cards[0],data.transactions),2500n);assert.equal(totals(data,'2026-01').expense,4000n);assert.equal(balance(data.accounts[0],data.transactions),8500n)});
test('future card payments do not prematurely reduce debt',()=>{assert.equal(cardDebt(data.credit_cards[0],[...data.transactions,{card_id:'c',type:'cc_payment',amount:'25.00',date:'2099-01-01'}]),2500n)});
console.log(`${count} finance tests passed`);
