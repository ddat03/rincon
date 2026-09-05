/**
 * Optimización de imágenes para la galería.
 *
 * Lee las fotos originales de ../IMAGES (carpeta que NO se publica),
 * descarta duplicados por hash, y genera dos versiones WebP de cada una:
 *   - fotos/galeria/gNN.webp         (máx 1600px, calidad 80) → se abre en el lightbox
 *   - fotos/galeria/thumbs/gNN.webp  (máx 640px,  calidad 72) → se ve en la cuadrícula
 *
 * Los videos (.mp4) se copian tal cual a fotos/galeria/.
 *
 * Uso:  cd tools && npm install && npm run optimize
 *
 * Después de correrlo, revisá data/galeria.json: el script deja una plantilla
 * con todas las fotos, solo tenés que reordenar o agregar el texto de cada una.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'IMAGES');
const OUT = path.join(__dirname, '..', 'fotos', 'galeria');
const THUMBS = path.join(OUT, 'thumbs');

const MAX_FULL = 1600;
const MAX_THUMB = 640;

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`No encuentro la carpeta de originales: ${SRC}`);
    console.error('Poné tus fotos originales ahí y volvé a correr el script.');
    process.exit(1);
  }
  fs.mkdirSync(THUMBS, { recursive: true });

  const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|mp4|mov)$/i.test(f));
  const seen = new Set();
  const unique = [];
  for (const f of files.sort()) {
    const buf = fs.readFileSync(path.join(SRC, f));
    const hash = crypto.createHash('md5').update(buf).digest('hex');
    if (seen.has(hash)) {
      console.log(`  duplicado, se omite: ${f}`);
      continue;
    }
    seen.add(hash);
    unique.push(f);
  }

  const entries = [];
  let n = 0;
  for (const f of unique) {
    n += 1;
    const id = `g${String(n).padStart(2, '0')}`;
    const srcPath = path.join(SRC, f);
    if (/\.(mp4|mov)$/i.test(f)) {
      fs.copyFileSync(srcPath, path.join(OUT, `${id}.mp4`));
      entries.push({ tipo: 'video', src: `fotos/galeria/${id}.mp4`, texto: '' });
      console.log(`  video  ${f} -> ${id}.mp4`);
      continue;
    }
    const img = sharp(srcPath).rotate(); // respeta orientación EXIF
    await img
      .clone()
      .resize(MAX_FULL, MAX_FULL, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(OUT, `${id}.webp`));
    await img
      .clone()
      .resize(MAX_THUMB, MAX_THUMB, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(path.join(THUMBS, `${id}.webp`));
    entries.push({
      tipo: 'foto',
      src: `fotos/galeria/${id}.webp`,
      thumb: `fotos/galeria/thumbs/${id}.webp`,
      texto: '',
    });
    console.log(`  foto   ${f} -> ${id}.webp`);
  }

  const galeriaPath = path.join(__dirname, '..', 'data', 'galeria.json');
  fs.writeFileSync(galeriaPath, JSON.stringify(entries, null, 2) + '\n');
  console.log(`\nListo: ${entries.length} elementos. Plantilla escrita en data/galeria.json`);
  console.log('Editá ese archivo para reordenar las fotos o agregar un texto a cada una.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
