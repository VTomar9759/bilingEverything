import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "../src/assets/pubicbackground.jpg");
const destWebp = path.join(__dirname, "../src/assets/pubicbackground.webp");
const destJpg = path.join(__dirname, "../src/assets/pubicbackground-opt.jpg");

const srcSize = (fs.statSync(src).size / 1024).toFixed(1);
console.log(`Source: ${srcSize} KB`);

// Create WebP version - best quality/size ratio
await sharp(src)
  .resize(1920, null, { withoutEnlargement: true })  // cap at 1920px wide
  .webp({ quality: 60, effort: 6 })
  .toFile(destWebp);

const webpSize = (fs.statSync(destWebp).size / 1024).toFixed(1);
console.log(`WebP (q60): ${webpSize} KB`);

// Create optimized JPEG fallback
await sharp(src)
  .resize(1920, null, { withoutEnlargement: true })
  .jpeg({ quality: 55, progressive: true, mozjpeg: true })
  .toFile(destJpg);

const jpgSize = (fs.statSync(destJpg).size / 1024).toFixed(1);
console.log(`JPEG fallback (q55): ${jpgSize} KB`);
console.log("Done!");

