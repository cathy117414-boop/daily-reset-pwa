import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import sharp from "sharp";

export const ICON_SIZES = [16, 32, 48, 64, 96, 120, 128, 144, 152, 167, 180, 192, 256, 384, 512];
const source = await readFile(new URL('../assets/branding/lumina-master.png', import.meta.url));
const metadata = await sharp(source).metadata();
if (metadata.width !== metadata.height || metadata.width < 512) throw new Error('Lumina master must be square and at least 512px.');
const output = new URL('../public/icons/', import.meta.url);
await mkdir(output, { recursive: true });
const pngs = new Map();
for (const size of ICON_SIZES) {
  // No crop, border or pre-rounded corners: let the operating system apply its mask.
  const png = await sharp(source).resize(size, size).removeAlpha().png().toBuffer();
  pngs.set(size, png);
  await writeFile(new URL(`lumina-flower-v1-${size}.png`, output), png);
}
// The supplied master already keeps petals and both stars within the central
// 80%-diameter safe circle. Separate opaque maskable files retain that framing.
for (const size of [192, 512]) {
  await writeFile(new URL(`lumina-flower-v1-maskable-${size}.png`, output), pngs.get(size));
}
// ICO with three PNG-backed frames, without introducing an image dependency.
const frames = [16, 32, 48];
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((size, i) => {
  const at = 6 + 16 * i;
  header[at] = size; header[at + 1] = size;
  header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(pngs.get(size).length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += pngs.get(size).length;
});
const ico = Buffer.concat([header, ...frames.map(size => pngs.get(size))]);
await writeFile(new URL('lumina-flower-v1.ico', output), ico);
await writeFile(new URL('../public/favicon.ico', import.meta.url), ico);
for (const [name, size] of [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['apple-touch-icon.png', 180], ['app-icon-192.png', 192], ['app-icon-512.png', 512], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await copyFile(new URL(`lumina-flower-v1-${size}.png`, output), new URL(`../public/${name}`, import.meta.url));
}
console.log(`Generated Lumina icons: ${ICON_SIZES.join(', ')}px, maskable 192/512 and ICO 16/32/48.`);
