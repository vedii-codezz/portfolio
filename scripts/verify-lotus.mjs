import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as motionPreference from '../components/motion-preference.ts';

// A missing unlock, premature session marker, or lost inline style must fail these checks.
const path = 'components/lotus-lifecycle.ts';
assert.ok(fs.existsSync(path), 'Lotus lifecycle controller must exist');
const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
function environment({ seen = false, blocked = false, hash = '', reducedMotion = false } = {}) {
  const root = { dataset: {} };
  const content = { inert: false, style: { opacity: '.8' }, attributes: new Map(),
    getAttribute(key) { return this.attributes.get(key) ?? null; },
    setAttribute(key, value) { this.attributes.set(key, value); },
    removeAttribute(key) { this.attributes.delete(key); } };
  const events = [];
  const timers = [];
  let saved = seen ? 'done' : null;
  const context = {
    exports: {},
    require(name) {
      assert.equal(name, './motion-preference');
      return motionPreference;
    },
    matchMedia(query) {
      assert.equal(query, motionPreference.reducedMotionQuery);
      return { matches: reducedMotion };
    },
    document: { documentElement: root, getElementById: () => content },
    location: { hash }, setTimeout: (fn, ms) => timers.push({ fn, ms }),
    window: { location: { hash }, dispatchEvent: e => events.push(e.type) },
    sessionStorage: { getItem() { if (blocked) throw Error('blocked'); return saved; },
      setItem(_, value) { if (blocked) throw Error('blocked'); saved = value; } },
    Event: class { constructor(type) { this.type = type; } } };
  vm.createContext(context); vm.runInContext(code, context);
  return { api: context.exports, root, content, events, timers, context, saved: () => saved };
}
const reduced = environment({ reducedMotion: true });
vm.runInContext(reduced.api.lotusBootstrap, reduced.context);
assert.equal(reduced.root.dataset.lotusLoading, 'complete');
assert.equal(reduced.api.shouldPlayLotus(), false);
assert.equal(reduced.timers.length, 0);

const first = environment();
vm.runInContext(first.api.lotusBootstrap, first.context);
assert.equal(first.api.shouldPlayLotus(), true);
const release = first.api.lockPortfolio(first.content);
assert.equal(first.content.inert, true, 'Keyboard and pointer interaction blocked during intro');
assert.equal(first.content.attributes.get('aria-hidden'), 'true');
assert.equal(first.saved(), null, 'Do not remember an interrupted intro as finished');
release(); release();
assert.equal(first.content.inert, false, 'Cleanup always unlocks content');
assert.equal(first.content.attributes.has('aria-hidden'), false);
assert.equal(first.content.style.opacity, '.8', 'Cleanup restores existing opacity');
first.api.completeLotus();
assert.equal(first.root.dataset.lotusLoading, 'complete');
assert.equal(first.saved(), null, 'Intro never writes a persistent skip marker');
assert.equal(first.api.shouldPlayLotus(), false, 'Same-document completion does not restart intro');
assert.deepEqual(first.events, ['portfolio:ready']);
for (const options of [{ seen: true }, { hash: '#work' }, { blocked: true }]) {
  const reload = environment(options);
  vm.runInContext(reload.api.lotusBootstrap, reload.context);
  assert.equal(reload.api.shouldPlayLotus(), true, 'Every document load replays, including saved visits and section links');
}
const blocked = environment({ blocked: true });
vm.runInContext(blocked.api.lotusBootstrap, blocked.context);
assert.equal(blocked.api.shouldPlayLotus(), true);
assert.doesNotThrow(() => blocked.api.completeLotus());
assert.equal(blocked.root.dataset.lotusLoading, 'complete');
const failedHydration = environment();
vm.runInContext(failedHydration.api.lotusBootstrap, failedHydration.context);
assert.equal(failedHydration.root.dataset.lotusLoading, 'pending', 'Hide portfolio before first paint');
failedHydration.api.lockPortfolio(failedHydration.content);
assert.equal(failedHydration.timers.length, 1);
assert.ok(failedHydration.timers[0].ms <= 5000, 'Recovery is bounded even if hydration never completes');
failedHydration.timers[0].fn();
assert.equal(failedHydration.root.dataset.lotusLoading, 'complete');
assert.equal(failedHydration.content.inert, false, 'Recovery unlocks interaction');
assert.equal(failedHydration.content.style.opacity, '');
assert.equal(failedHydration.content.attributes.has('aria-hidden'), false);
for (const options of [{ seen: true }, { hash: '#story' }]) {
  const skip = environment(options);
  vm.runInContext(skip.api.lotusBootstrap, skip.context);
  assert.equal(skip.root.dataset.lotusLoading, 'pending', 'Every fresh document has a pre-paint intro');
  assert.equal(skip.timers.length, 1);
}
const remount = environment();
remount.api.lockPortfolio(remount.content)();
const undo = remount.api.lockPortfolio(remount.content);
assert.equal(remount.content.inert, true, 'Strict Mode remount locks correctly');
undo();
assert.equal(remount.content.inert, false);
const restored = environment();
vm.runInContext(restored.api.lotusBootstrap, restored.context);
restored.api.completeLotus();
restored.root.dataset.lotusLoading = 'pending';
restored.timers[0].fn();
assert.equal(restored.root.dataset.lotusLoading, 'pending', 'Expired document recovery cannot interrupt a restored-document replay');
console.log('Lotus checks passed: every-document replay, no persistent skip, pre-paint gating, storage independence, interaction lock, Strict Mode cleanup, stale recovery isolation, and failed-hydration recovery.');
