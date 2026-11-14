import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as motionPreference from '../components/motion-preference.ts';
const require=createRequire(import.meta.url);
const helper={exports:{}};vm.createContext(helper);
vm.runInContext(ts.transpileModule(fs.readFileSync('components/journey-motion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,helper);
const points=[{x:140,y:310},{x:120,y:500},{x:140,y:714}];
for(const [progress,x,y] of [[0,140,310],[1,140,714],[.25,130,405],[-1,140,310],[2,140,714]]) {
  const point=helper.exports.journeyPoint(points,progress);
  assert.equal(point.x,x);assert.equal(point.y,y);
}
const context={
  exports:{},
  require(name) {
    if (name === './journey-motion') return helper.exports;
    if (name === './motion-preference') return motionPreference;
    return require(name);
  },
};
vm.createContext(context);vm.runInContext(ts.transpileModule(fs.readFileSync('components/LotusJourney.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
const markup=renderToStaticMarkup(React.createElement(context.exports.LotusJourney));
assert.equal((markup.match(/class="journey-traveler"/g)||[]).length,2);
assert.equal((markup.match(/transform="translate\(140 310\)"/g)||[]).length,2,'Both variants author the marker at the vine origin, never SVG origin');
assert.ok(markup.includes('journey-flower')&&markup.includes('journey-vine'),'Compact flower and vine render independently');
console.log('Journey checks passed: marker start/end/interpolation/reverse clamping and SSR mobile/desktop origins.');
