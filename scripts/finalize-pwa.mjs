import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function finalizePwa(outputDirectory) {
  const root = resolve(outputDirectory);
  async function collect(directory) {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'sw.js') continue;
      const full = join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await collect(full));
      else if (/\.(?:js|css|html|json|webp|png|svg|ico|woff2?)$/.test(entry.name)) files.push(full);
    }
    return files;
  }
  const files = (await collect(root)).sort();
  const template = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  const hash = createHash('sha256').update(template);
  const assets = [];
  for (const file of files) {
    const name = relative(root, file).replaceAll('\\', '/');
    hash.update(name).update(await readFile(file));
    if (name !== 'index.html') assets.push(name);
  }
  if (basename(root) === 'client') {
    hash.update(await readFile(resolve(root, '../server/index.js')));
  }
  const buildId = `v7-${hash.digest('hex').slice(0, 16)}`;
  const worker = template.replace('__LUMINA_BUILD_ID__', buildId)
    .replace('/* LUMINA_PRECACHE */ []', JSON.stringify(assets));
  await writeFile(join(root, 'sw.js'), worker);
  console.log(`PWA ${buildId}: ${assets.length} offline assets (${root})`);
  return { buildId, assets };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/finalize-pwa.mjs OUTPUT_DIR');
  await finalizePwa(process.argv[2]);
}
