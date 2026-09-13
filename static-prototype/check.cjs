/* Не нужен для запуска сайта. Проверка скриптов и сценариев в модели DOM: node check.cjs. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor(tag, ns='http://www.w3.org/1999/xhtml') {
    this.tagName=tag.toUpperCase(); this.namespaceURI=ns; this.childNodes=[];
    this.attrs={}; this.events={}; this.style={setProperty(k,v){this[k]=v;}};
    this.value=''; this.scrollTop=0; this.scrollLeft=0;
  }
  insertBefore(el,before) { el.remove(); const i=before?this.childNodes.indexOf(before):this.childNodes.length; this.childNodes.splice(i,0,el); el.parent=this; }
  remove() { if(this.parent){const a=this.parent.childNodes; a.splice(a.indexOf(this),1);this.parent=null;} }
  setAttribute(k,v){this.attrs[k]=v;}
  removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,fn){this.events[k]=fn;}
  removeEventListener(k,fn){if(this.events[k]===fn)delete this.events[k];}
  focus(){this.focused=true;}
  scrollTo(o){this.scrollLeft=o.left || 0;}
  getBoundingClientRect(){return {left:0,right:400,top:0,bottom:700,width:400,height:700};}
  get textContent(){return this.data??this.childNodes.map(x=>x.textContent).join('');}
  get children(){return this.childNodes.filter(x=>x.tagName!=='#TEXT');}
}
const pages=['desktop.html','mobile.html','school/login.html','school/welcome.html','school/school.html'];
function load(page){
  const root=new Element('div'), tasks=[], timers=[];
  const document={getElementById:()=>root,documentElement:new Element('html'),createElement:t=>new Element(t),createElementNS:(ns,t)=>new Element(t,ns),createTextNode:t=>Object.assign(new Element('#text'),{data:t})};
  const storage=new Map();
  const context={document,console,queueMicrotask:fn=>tasks.push(fn),setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:()=>{},requestAnimationFrame:fn=>tasks.push(fn),cancelAnimationFrame:()=>{},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},location:{href:''},addEventListener(){},removeEventListener(){},postMessage(){},dispatchEvent(){},innerWidth:1000,innerHeight:800};
  context.window=context;context.parent=context;
  context.ResizeObserver=class{observe(){}disconnect(){}};
  const sandbox=vm.createContext(context);
  const html=fs.readFileSync(path.join(__dirname,page),'utf8');
  for(const match of html.matchAll(/<script src="([^"]+)"/g)){
    const file=path.resolve(__dirname,path.dirname(page),match[1]);
    vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
  }
  function flush(){let n=0;while(tasks.length){assert.ok(n++<100,'render loop');tasks.shift()();}}
  function all(el=root){return [el,...el.childNodes.flatMap(x=>all(x))];}
  function click(text){const el=all().find(e=>e.tagName==='BUTTON'&&e.textContent.includes(text));assert.ok(el,'button: '+text);assert.ok(el.events.click);el.events.click({target:el,currentTarget:el,preventDefault(){},stopPropagation(){}});flush();return el;}
  function input(el,value){assert.ok(el);el.value=value;el.events.input({target:el,currentTarget:el});flush();}
  flush();assert.ok(root.textContent.length>30,page);
  return {root,all,click,input,flush,context,timers};
}
for(const page of pages){const app=load(page);console.log('PASS render',page,app.root.textContent.length);}
let app=load('mobile.html');
app.click('Задания');assert.match(app.root.textContent,/ЗАДАНИЯ/);
app.click('Блог');assert.match(app.root.textContent,/БЛОГ/);
app.click('Характеристики');assert.match(app.root.textContent,/ХАРАКТЕРИСТИКИ/);
console.log('PASS mobile navigation');
app=load('desktop.html');app.click('Задания');app.click('Блог');console.log('PASS desktop navigation');
app=load('school/school.html');app.click('Карта');assert.match(app.root.textContent,/КАРТА/);app.click('Бэджик');app.click('Мастерские');console.log('PASS school navigation');
app=load('school/login.html');
const login=app.all().find(e=>e.tagName==='INPUT'&&e.attrs.maxLength!=='1');
app.input(login,'Demo');
const fields=app.all().filter(e=>e.tagName==='INPUT'&&e.attrs.maxLength==='1');
assert.equal(fields.length,6);
for(let i=0;i<6;i++)app.input(fields[i],String(i+1));
while(app.timers.length){app.timers.shift()();app.flush();}
assert.equal(app.context.location.href,'welcome.html');console.log('PASS demo login and redirect');
app=load('school/welcome.html');app.click('Привет. Я тут первый раз');
assert.match(app.root.textContent,/Как тебя зовут/);
console.log('PASS welcome dialogue');
app.input(app.all().find(e=>e.tagName==='INPUT'),'Демо');app.click('Готово');app.click('Взять');
app.click('А что дальше делать?');app.click('Взять');app.click('Спасибо, пойду осмотрюсь');
assert.ok(app.all().some(e=>e.attrs.href==='school.html'));console.log('PASS complete welcome and school link');
app=load('school/school.html');
const search=app.all().find(e=>e.tagName==='INPUT');
app.input(search,'несуществующая мастерская');assert.match(app.root.textContent,/пока нет/);
app.input(search,'');assert.ok(app.all().includes(search),'search input retained');
const card=app.all().find(e=>e.tagName==='ARTICLE');
card.events.click({target:card,currentTarget:card});app.flush();
assert.match(app.root.textContent,/МАСТЕРСКАЯ/);
const answer=app.all().find(e=>e.tagName==='BUTTON'&&e.attrs.class==='ws-answer');
assert.ok(answer);answer.events.click({target:answer,currentTarget:answer});app.flush();
app.click('Назад');assert.match(app.root.textContent,/Все мастерские/);console.log('PASS workshop search, dialogue and back');
app=load('mobile.html');app.click('Задания');
app.click('Подробнее');
app.click('Взять задание');assert.match(app.root.textContent,/Задание взято/);app.click('Назад');
app.click('Блог');app.click('❤️');assert.ok(app.all().some(e=>e.tagName==='BUTTON'&&e.textContent.includes('❤️ 2')));
app.click('❤️');assert.ok(app.all().some(e=>e.tagName==='BUTTON'&&e.textContent.includes('❤️ 1')));console.log('PASS task action and blog reaction toggle');
for(const page of ['index.html',...pages]){
  const html=fs.readFileSync(path.join(__dirname,page),'utf8');
  for(const [,url]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    if(url.startsWith('#')||url.startsWith('data:'))continue;
    assert.ok(!/^https?:/.test(url),'external dependency: '+url);
    assert.ok(fs.existsSync(path.resolve(__dirname,path.dirname(page),url)),'missing file: '+url);
  }
}
console.log('PASS local HTML dependencies');
