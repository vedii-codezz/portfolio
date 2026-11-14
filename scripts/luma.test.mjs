import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { projects } from '../data/projects.ts';
const require=createRequire(import.meta.url);
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const exports={};cache.set(file,exports);
 const localRequire=name=>{
  if(name.endsWith('.css'))return {};
  if(!name.startsWith('.')&&!name.startsWith('@/'))return require(name);
  const target=name.startsWith('@/')?name.slice(2):path.join(path.dirname(file),name);
  return load(['.ts','.tsx'].map(extension=>target+extension).find(candidate=>fs.existsSync(candidate)));
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,require:localRequire});return exports;
}
test('Selected Work reserves the gallery and renders project links without JavaScript',()=>{
 const html=renderToStaticMarkup(createElement(load('components/SelectedWork.tsx').SelectedWork));
 assert.match(html,/class="work-gallery-skeleton"/);
 assert.match(html,/class="work-count">05/);
 assert.deepEqual(projects.map(project=>project.order),[1,2,3,4,5]);
 const fallback=html.match(/<noscript>(.*?)<\/noscript>/)?.[1];
 assert.ok(fallback);
 for(const project of projects) {
  assert.ok(fallback.includes(project.live));
  assert.ok(fallback.includes(project.title));
 }
});
