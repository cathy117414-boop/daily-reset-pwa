import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const sizes = [16,32,48,64,96,120,128,144,152,167,180,192,256,384,512];
test('all final Lumina icons have exact dimensions and opaque square corners', async () => {
  for (const size of sizes) {
    const url = new URL(`public/icons/lumina-flower-v1-${size}.png`, root);
    const info = await sharp(await readFile(url)).metadata();
    assert.equal(info.width, size); assert.equal(info.height, size);
    assert.equal(info.hasAlpha, false);
  }
  const info = await sharp(await readFile(new URL('public/apple-touch-icon.png', root))).metadata();
  assert.equal(info.width,180); assert.equal(info.height,180);
});
test('manifest separates any and maskable, keeps identity, and every image resolves', async () => {
  const manifest = JSON.parse(await readFile(new URL('public/manifest.json', root),'utf8'));
  assert.equal(manifest.start_url,'.'); assert.equal(manifest.scope,'.'); assert.equal(manifest.name,'Lumina');
  assert.deepEqual(manifest.icons.map(i=>`${i.sizes}:${i.purpose}`).sort(),['192x192:any','192x192:maskable','512x512:any','512x512:maskable']);
  for (const icon of manifest.icons) {
    const info=await sharp(await readFile(new URL(`public/${icon.src}`,root))).metadata();
    assert.equal(`${info.width}x${info.height}`,icon.sizes); assert.equal(info.hasAlpha,false);
  }
});
test('ICO contains valid 16,32,48 PNG frames and legacy PNG aliases use the final image', async () => {
  const ico=await readFile(new URL('public/favicon.ico',root));
  assert.equal(ico.readUInt16LE(2),1); assert.equal(ico.readUInt16LE(4),3);
  for (let i=0;i<3;i++) {
    const at=6+16*i, length=ico.readUInt32LE(at+8), offset=ico.readUInt32LE(at+12);
    const frame=await sharp(ico.subarray(offset,offset+length)).metadata();
    assert.equal(frame.width,[16,32,48][i]); assert.equal(frame.height,frame.width);
  }
  for (const [file,size] of [['app-icon-192.png',192],['app-icon-512.png',512],['icon-192.png',192],['icon-512.png',512],['favicon-16x16.png',16],['favicon-32x32.png',32],['apple-touch-icon.png',180]]) {
    assert.deepEqual(await readFile(new URL(`public/${file}`,root)),await readFile(new URL(`public/icons/lumina-flower-v1-${size}.png`,root)));
  }
});
test('both entrypoints use 180px apple icon and never reference the removed green SVG', async () => {
  for (const file of ['index.html','app/layout.tsx','public/sw.js']) {
    const text=await readFile(new URL(file,root),'utf8');
    assert.ok(text.includes('lumina-flower-v1-180.png')); assert.ok(!text.includes('app-icon.svg'));
  }
  await assert.rejects(access(new URL('public/app-icon.svg',root)));
});
