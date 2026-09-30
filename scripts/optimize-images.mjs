/**
 * Optimiza las fotos originales de /photos-src → /public/img (AVIF + WebP, varios anchos)
 * y genera src/data/photos.json con dimensiones y un placeholder difuminado (LQIP).
 *
 * Uso: coloca las fotos originales en /photos-src con el nombre final (ej. equipo.jpg)
 *      y ejecuta `npm run images`.
 */
import sharp from 'sharp';
import { readdir, mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'photos-src';
const OUT = 'public/img';
const WIDTHS = [480, 960, 1600, 2400];

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f));
// Conserva lo ya generado: solo se procesan fotos nuevas (usa --all para regenerar todo).
const all = process.argv.includes('--all');
const manifest = all ? {} : JSON.parse(await readFile('src/data/photos.json', 'utf8').catch(() => '{}'));

for (const file of files) {
  const name = path.parse(file).name;
  if (manifest[name] && !all) continue;
  const input = sharp(path.join(SRC, file)).rotate();
  const { width, height } = await input.metadata();
  const widths = WIDTHS.filter((w) => w < width).concat(width > 2400 ? [] : [width]);

  for (const w of [...new Set(widths)]) {
    const resized = input.clone().resize({ width: w, withoutEnlargement: true });
    await resized.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await resized.clone().webp({ quality: 74 }).toFile(`${OUT}/${name}-${w}.webp`);
  }

  const lqip = await input.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[name] = {
    w: width,
    h: height,
    widths: [...new Set(widths)].sort((a, b) => a - b),
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
  console.log(`✓ ${name} (${width}×${height})`);
}

await writeFile('src/data/photos.json', JSON.stringify(manifest, null, 2));
console.log(`\n${files.length} fotos optimizadas → ${OUT}`);
