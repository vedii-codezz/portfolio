import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file) {
  const exports = {};
  const localRequire = name => {
    if (name.endsWith('.css')) return {};
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const target = name.startsWith('@/') ? name.slice(2) : path.join(path.dirname(file), name);
    return load(['.ts', '.tsx'].map(extension => target + extension).find(candidate => fs.existsSync(candidate)));
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: localRequire });
  return exports;
}

test('toolkit exposes four flip controls and all 29 technologies in semantic lists', () => {
  const html = renderToStaticMarkup(createElement(load('components/TechStack.tsx').TechStack));
  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 4);
  assert.equal((html.match(/data-flip-face="back"[^>]*aria-hidden="true"/g) ?? []).length, 4);
  assert.equal((html.match(/<ul /g) ?? []).length, 4);
  assert.equal((html.match(/<li[ >]/g) ?? []).length, 29);
  assert.ok(!html.includes('>Spline</span>'));
  for (const technology of ['Python', 'JavaScript', 'HTML5', 'CSS3', 'C', 'Java', 'GSAP', 'Framer Motion', 'Generative AI', 'Gemini API', 'Multi-Agent Systems', 'NumPy', 'FastAPI', 'Git', 'GitHub', 'VS Code', 'Vercel', 'Kaggle', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Zod', 'Zustand', 'MapLibre GL', 'Drizzle ORM', 'Lenis']) {
    assert.ok(html.includes(`>${technology}</span>`), `${technology} is listed`);
  }
  assert.equal((html.match(/data-stack-category/g) ?? []).length, 4);
});
