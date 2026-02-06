#!/usr/bin/env node
/**
 * Gera os ícones PNG do PWA a partir do favicon.svg
 * Execução: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SVG_PATH = resolve(ROOT, "public/favicon.svg");
const ICONS_DIR = resolve(ROOT, "public/icons");

// Tamanhos necessários para PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  mkdirSync(ICONS_DIR, { recursive: true });

  const svgBuffer = readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outputPath = resolve(ICONS_DIR, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size, { fit: "contain", background: { r: 245, g: 245, b: 245, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`✓ icon-${size}.png`);
  }

  // Gerar apple-touch-icon (180x180)
  const applePath = resolve(ROOT, "public/apple-touch-icon.png");
  await sharp(svgBuffer)
    .resize(180, 180, { fit: "contain", background: { r: 245, g: 245, b: 245, alpha: 1 } })
    .png()
    .toFile(applePath);
  console.log("✓ apple-touch-icon.png");

  // Gerar favicon.ico (32x32 PNG como fallback)
  const faviconPath = resolve(ROOT, "public/favicon.ico");
  await sharp(svgBuffer)
    .resize(32, 32, { fit: "contain", background: { r: 245, g: 245, b: 245, alpha: 1 } })
    .png()
    .toFile(faviconPath);
  console.log("✓ favicon.ico");

  console.log("\nTodos os ícones gerados com sucesso!");
}

main().catch((err) => {
  console.error("Erro ao gerar ícones:", err);
  process.exit(1);
});
