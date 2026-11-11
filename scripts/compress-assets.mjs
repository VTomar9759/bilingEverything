import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(__dirname, "../src/assets");

async function compress(src, dest, opts) {
  const before = (fs.statSync(src).size / 1024).toFixed(1);
  if (dest.endsWith(".webp")) {
    await sharp(src).webp(opts).toFile(dest);
  } else if (dest.endsWith(".png")) {
    await sharp(src).png(opts).toFile(dest);
  }
  const after = (fs.statSync(dest).size / 1024).toFixed(1);
  console.log(`${path.basename(src)}: ${before} KB → ${path.basename(dest)}: ${after} KB`);
}

// Logo: PNG → WebP (preserving transparency if any)
await compress(
  path.join(assets, "logo.png"),
  path.join(assets, "logo.webp"),
  { quality: 85, effort: 6 }
);

// No-image: PNG → WebP
await compress(
  path.join(assets, "no-image.png"),
  path.join(assets, "no-image.webp"),
  { quality: 80, effort: 6 }
);

console.log("Done!");

