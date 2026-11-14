import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { projects, carouselDescriptions } from '../data/projects.ts';
import { nearestProject, ringRadius, advanceRing } from '../components/carousel-geometry.ts';
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
test('Selected Work renders five artwork-only cards with one initial details panel',()=>{
 const html=renderToStaticMarkup(createElement(load('components/SelectedWork.tsx').SelectedWork));
 assert.equal((html.match(/class="carousel-card"/g)??[]).length,5);
 assert.equal((html.match(/class="carousel-art-tile"/g)??[]).length,15);
 assert.equal((html.match(/class="carousel-art-tile carousel-art-back"/g)??[]).length,15);
 assert.equal((html.match(/class="carousel-tiled-surface" aria-hidden="true" inert=""/g)??[]).length,5);
 assert.equal((html.match(/<a /g)??[]).length,2);
 assert.match(html,/class="work-count">05/);
 assert.deepEqual([...html.matchAll(/data-project="([^"]+)"/g)].map(match=>match[1]),projects.map(project=>project.slug));
 assert.ok(!html.includes('carousel-editorial'));
 assert.ok(html.includes(carouselDescriptions.finora));
 for(const [index,project] of projects.entries()) {
  const details=renderToStaticMarkup(createElement(load('components/ProjectDetailsPanel.tsx').ProjectDetailsPanel,{project,index}));
  assert.ok(details.includes(project.live)); assert.ok(details.includes(project.github));
  assert.ok(details.includes(carouselDescriptions[project.slug]));
 }
});
test('five-card ring advances through LUMA and wraps to Finora without geometry changes',()=>{
 assert.equal(projects.length,5);
 assert.equal(nearestProject(-288,projects.length),4);
 assert.equal(nearestProject(-360,projects.length),0);
 assert.equal(nearestProject(72,projects.length),4);
 assert.ok(Math.abs(ringRadius(projects.length,276,25)-239.5282)<.001);
 let state={angle:-288,velocity:0,target:-360};
 for(let i=0;i<240;i++)state=advanceRing(state,1/60);
 assert.equal(state.angle,-360);assert.equal(nearestProject(state.angle,projects.length),0);
});
