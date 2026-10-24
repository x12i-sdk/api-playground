import assert from 'node:assert/strict';
import { createRuns } from '@x12i/api-playground/runs.js';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<ul id="list"></ul><select id="endpoint"></select><select id="status"><option value="">All</option></select><div id="actions"></div><button id="clear"></button><button id="open"></button><button id="close"></button><div id="backdrop"></div><div id="drawer"></div>', { url: 'https://fixture.example.invalid' });
const oldStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const oldWindow = globalThis.window;
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: dom.window.localStorage });
globalThis.window = dom.window;
let history = [];
try {
  const element = id => dom.window.document.getElementById(id);
  const endpoint = { id: 'health', name: 'Fixture health' };
  const runs = createRuns({ listEl: element('list'), filterEndpoint: element('endpoint'), filterStatus: element('status'),
    actionsEl: element('actions'), clearBtn: element('clear'), openBtn: element('open'), closeBtn: element('close'), backdrop: element('backdrop'), drawer: element('drawer'),
    onRestore() {}, onRerun() {}, getStateHistory: () => history, setStateHistory: next => { history = next; }, storagePrefix: 'fixture', endpoints: [endpoint], getEndpoint: () => endpoint,
  });
  const entry = runs.push({ id: 'fixture-run', endpoint: endpoint.id, primaryInput: 'Local check', status: 'ok', statusCode: 200, response: { ok: true } });
  assert.equal(history.length, 1);
  assert.equal(runs.load()[0].id, entry.id);
  assert(element('list').textContent.includes('Fixture health'));
  console.log({ saved: entry.id, visibleText: element('list').textContent.trim() });
} finally {
  if (oldStorage === undefined) delete globalThis.localStorage; else Object.defineProperty(globalThis, 'localStorage', oldStorage);
  if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
  dom.window.close();
}
// Browser history only: no request is sent and no real browser storage is changed.
