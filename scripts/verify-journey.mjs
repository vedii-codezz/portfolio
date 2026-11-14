import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { nodeProgress, vineThrough } from '../components/journey-motion.ts';

assert.equal(vineThrough(50, 300, [60, 180], 20), 'M50 0C70 20 70 40 50 60C30 100 30 140 50 180C70 220 70 260 50 300');
const straight = { getPointAtLength: length => ({ x: 0, y: length }) };
for (const y of [0, 10, 50, 75, 100]) {
  assert.ok(Math.abs(nodeProgress(straight, 100, y) - y / 100) < .00001);
}

const context = { exports: {}, require: createRequire(import.meta.url) };
const source = fs.readFileSync('components/LotusJourney.tsx', 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
vm.runInNewContext(outputText, context);
const markup = renderToStaticMarkup(React.createElement(context.exports.LotusJourney));
assert.equal((markup.match(/data-story-petal/g) ?? []).length, 9);
assert.match(markup, /aria-hidden="true"/);
assert.match(renderToStaticMarkup(React.createElement(context.exports.JourneyLeaf, { index: 5 })), /data-story-leaf/);
console.log('Journey checks passed: path through chapter nodes, length mapping and static lotus artwork.');
