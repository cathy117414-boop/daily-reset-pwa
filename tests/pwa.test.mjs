import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile, mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { finalizePwa } from '../scripts/finalize-pwa.mjs';

const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const home = 'https://example.test/daily-reset-pwa/';
function harness({ failPrecache = false } = {}) {
  const handlers = {};
  const data = new Map();
  const counts = { skip:0, claim:0, fetch:0 };
  const key = value => typeof value === 'string' ? value : value.url;
  const caches = {
    keys:async () => [...data.keys()],
    delete:async name => data.delete(name),
    open:async name => {
      if (!data.has(name)) data.set(name, new Map());
      const entries = data.get(name);
      return {
        addAll:async requests => {
          if (failPrecache) throw new Error('One new bundle is missing');
          for (const request of requests) entries.set(key(request), new Response('cached'));
        },
        match:async request => entries.get(key(request))?.clone(),
        put:async (request, response) => entries.set(key(request), response.clone()),
      };
    },
  };
  let fetchResult = () => new Response('fresh', {headers:{'content-type':'text/html'}});
  const self = {
    registration:{scope:home},
    addEventListener:(type, handler) => handlers[type] = handler,
    skipWaiting:async () => counts.skip++,
    clients:{claim:async () => counts.claim++},
  };
  const code = source.replace('__LUMINA_BUILD_ID__','test-A')
    .replace('/* LUMINA_PRECACHE */ []', '["assets/index-abcdefgh.js","manifest.json"]');
  vm.runInNewContext(code, {self,caches,URL,Request,Response,AbortController,setTimeout,clearTimeout,fetch:async (...args) => {counts.fetch++; return fetchResult(...args);}});
  const lifetime = async type => {
    let work;
    handlers[type]({waitUntil:promise => work = promise});
    await work;
  };
  const request = async (path = '', mode = 'navigate') => {
    let result;
    handlers.fetch({request:{url:home+path,method:'GET',mode},respondWith:promise => result = promise});
    return result;
  };
  return {data,caches,counts,lifetime,request,network:fn => fetchResult = fn};
}

test('new worker installs the offline shell before activating and cleans only owned caches', async () => {
  const h = harness();
  await h.caches.open('daily-reset-v6-literary');
  await h.caches.open('unrelated-app-cache');
  await h.lifetime('install');
  assert.equal(h.counts.skip, 1);
  const current = [...h.data.keys()].find(k => k.endsWith('test-A'));
  assert.ok(h.data.get(current).has(home+'assets/index-abcdefgh.js'));
  await h.lifetime('activate');
  assert.equal(h.data.has('daily-reset-v6-literary'), false);
  assert.equal(h.data.has('unrelated-app-cache'), true);
  assert.equal(h.counts.claim, 1);
});

test('HTML and manifest prefer network, return last successful response offline, and assets never get HTML', async () => {
  const h = harness();
  await h.lifetime('install');
  assert.equal(await (await h.request()).text(), 'fresh');
  h.network(() => new Response('{"name":"Lumina new"}',{headers:{'content-type':'application/manifest+json'}}));
  assert.equal(await (await h.request('manifest.json','cors')).text(), '{"name":"Lumina new"}');
  h.network(() => {throw new Error('offline');});
  assert.equal(await (await h.request()).text(), 'fresh');
  assert.equal(await (await h.request('manifest.json','cors')).text(), '{"name":"Lumina new"}');
  const missing = await h.request('missing.webp','cors');
  assert.equal(missing.status, 503);
  assert.ok(!missing.headers.get('content-type').includes('text/html'));
});

test('content-hashed assets are cache-first and worker scripts bypass the app cache', async () => {
  const h = harness();
  await h.lifetime('install');
  h.network(() => new Response('worker-new'));
  assert.equal(await (await h.request('assets/index-abcdefgh.js','cors')).text(), 'cached');
  assert.equal(h.counts.fetch, 0);
  assert.equal(await (await h.request('sw.js','cors')).text(), 'worker-new');
  assert.equal(h.counts.fetch, 1);
});

test('failed installation leaves the old working cache intact and does not activate', async () => {
  const h = harness({ failPrecache: true });
  await h.caches.open('daily-reset-v6-literary');
  await assert.rejects(h.lifetime('install'), /missing/);
  assert.equal(h.data.has('daily-reset-v6-literary'), true);
  assert.equal(h.counts.skip, 0);
  assert.equal([...h.data.keys()].some(k => k.endsWith('test-A')), false);
});

test('build version changes when content changes even if the developer does not edit sw.js', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'lumina-pwa-test-'));
  await mkdir(join(dir,'assets'));
  await writeFile(join(dir,'index.html'),'<html>A</html>');
  await writeFile(join(dir,'assets/index-abcdefgh.js'),'version A');
  const a = await finalizePwa(dir);
  const identical = await finalizePwa(dir);
  assert.equal(a.buildId, identical.buildId);
  await writeFile(join(dir,'assets/index-abcdefgh.js'),'version B');
  const b = await finalizePwa(dir);
  assert.notEqual(a.buildId,b.buildId);
  const sw = await readFile(join(dir,'sw.js'),'utf8');
  assert.ok(sw.includes(b.buildId));
  assert.ok(!sw.includes('__LUMINA_BUILD_ID__'));
});
