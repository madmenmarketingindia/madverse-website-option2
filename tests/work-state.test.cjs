const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'work.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'js/work.js'), 'utf8');

function boot(storage = {}, options = {}) {
  const buttons = [...html.matchAll(/data-work-filter="([^"]+)"/g)].map(m => ({
    dataset: { workFilter: m[1] }, textContent: m[1], attributes: {},
    classList: { toggle() {} }, setAttribute(k, v) { this.attributes[k] = v; }
  }));
  const cards = [...html.matchAll(/<article\b[^>]*data-work-card[^>]*data-work-category="([^"]+)"/g)].map((m, id) => ({
    id, dataset: { workCategory: m[1] }, querySelector() { return {}; }
  }));
  const events = {};
  const filters = { dataset: {}, querySelectorAll: () => buttons,
    addEventListener(t, fn) { this[t] = fn; }, contains: () => true, dispatchEvent() {} };
  const grid = { children: [...cards], addEventListener(t, fn) { this[t] = fn; },
    appendChild(card) { this.children = this.children.filter(c => c !== card); this.children.push(card); } };
  const more = { addEventListener(t, fn) { this[t] = fn; } };
  const status = {};
  const elements = { '[data-work-filters]': filters, '[data-work-grid]': grid,
    '[data-work-load-more]': more, '[data-work-filter-status]': status };
  const scrolls = [];
  const window = {
    location: { hash: options.hash || '' }, scrollY: 0,
    sessionStorage: {
      getItem(k) { if (options.blocked) throw Error('blocked'); return storage[k] || null; },
      setItem(k, v) { if (options.blocked) throw Error('blocked'); storage[k] = v; }
    },
    addEventListener(type, fn) { (events[type] ||= []).push(fn); },
    requestAnimationFrame(fn) { fn(); },
    scrollTo(position) { scrolls.push(position.top); this.scrollY = position.top; }
  };
  vm.runInNewContext(source, { window, document: {
    querySelector: s => elements[s], querySelectorAll: () => cards,
    documentElement: { style: { scrollBehavior: '' } }
  }, CustomEvent: function () {} });
  return { window, filters, more, cards, buttons, status, scrolls,
    visible: () => grid.children.filter(c => !c.hidden),
    select(category) { filters.click({ target: { closest: () => buttons.find(b => b.dataset.workFilter === category) } }); },
    emit(type, event = {}) { (events[type] || []).forEach(fn => fn(event)); } };
}

const storage = {};
const first = boot(storage);
assert.equal(first.visible().length, 8);
first.select('print');
first.more.click(); first.more.click();
assert.equal(first.visible().length, 18);
first.window.scrollY = 1240;
first.emit('pagehide');
const restored = boot(storage);
assert.equal(restored.filters.dataset.activeFilter, 'print');
assert.equal(restored.visible().length, 18);
assert(restored.visible().every(c => c.dataset.workCategory.split(/\s+/).includes('print')));
assert.equal(restored.buttons.find(b => b.dataset.workFilter === 'print').attributes['aria-pressed'], 'true');
restored.emit('pageshow', { persisted: false });
assert.deepEqual(restored.scrolls, [1240]);
restored.more.click();
assert.equal(restored.visible().length, 24);
restored.select('all');
assert.equal(restored.visible().length, 8);
restored.more.click(); assert.equal(restored.visible().length, 14);

const snapshot = { 'madverse.work.browsing.v1': JSON.stringify({ filter: 'print', additionalVisible: 12, scrollY: 1240 }) };
const anchor = boot(snapshot, { hash: '#all-work' });
anchor.emit('pageshow'); assert.equal(anchor.scrolls.length, 0);
const cached = boot(snapshot);
cached.emit('pageshow', { persisted: true }); assert.equal(cached.scrolls.length, 0);
const interacted = boot(snapshot);
interacted.emit('wheel'); interacted.emit('pageshow'); assert.equal(interacted.scrolls.length, 0);
for (const value of ['broken JSON', JSON.stringify({ filter: 'removed', additionalVisible: 12, scrollY: 100 }),
  JSON.stringify({ filter: 'all', additionalVisible: -1, scrollY: 100 })]) {
  assert.equal(boot({ 'madverse.work.browsing.v1': value }).visible().length, 8);
}
const blocked = boot({}, { blocked: true });
blocked.select('print'); blocked.more.click(); blocked.emit('pagehide');
assert.equal(blocked.visible().length, 12);
console.log('PASS: tab, loaded count, scroll restoration, +6 loading, reset, anchors, BFCache, interaction cancellation and unavailable/invalid storage.');
