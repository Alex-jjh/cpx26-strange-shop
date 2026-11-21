// Generates display-size WebP copies of product images. Originals in public/products/ stay
// byte-identical to the CRAZYMIKE package (validate.py checks them); the app only loads these.
//   public/products/thumb/<name>.webp  360px wide  (shop grid)
//   public/products/large/<name>.webp  900px wide  (product page)
// Run after product images change: npm run images
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SRC = 'public/products'
const SIZES = { thumb: 360, large: 900 }

const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
for (const [dir, width] of Object.entries(SIZES)) {
  await mkdir(path.join(SRC, dir), { recursive: true })
  for (const f of files) {
    const out = path.join(SRC, dir, f.replace(/\.[^.]+$/, '.webp'))
    await sharp(path.join(SRC, f)).resize({ width, withoutEnlargement: true }).webp({ quality: 74 }).toFile(out)
  }
}
console.log(`${files.length} images × ${Object.keys(SIZES).length} sizes`)
