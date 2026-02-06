#!/usr/bin/env node
/**
 * Gera os ícones PNG do PWA a partir do favicon.svg
 * Fundo verde (#C0DF16) com ícone preto
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

// Cores
const BG_COLOR = { r: 192, g: 223, b: 22, alpha: 1 }; // #C0DF16
const ICON_PADDING = 0.2; // 20% de padding em cada lado

// Tamanhos necessários para PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * Gera um ícone PNG com fundo verde e o SVG preto centralizado
 */
async function generateIcon(svgBuffer, size, outputPath) {
  // Tamanho do ícone SVG com padding
  const iconSize = Math.round(size * (1 - ICON_PADDING * 2));

  // Renderizar o SVG em preto no tamanho desejado
  const iconLayer = await sharp(svgBuffer)
    .resize(iconSize, iconSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Criar fundo verde e compor o ícone por cima
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([
      {
        input: iconLayer,
        gravity: "centre",
      },
    ])
    .png()
    .toFile(outputPath);
}

async function main() {
  mkdirSync(ICONS_DIR, { recursive: true });

  // Ler o SVG e garantir que o fill é preto
  let svgContent = readFileSync(SVG_PATH, "utf-8");
  // Forçar fill preto em todos os paths
  svgContent = svgContent.replace(/<path /g, '<path fill="#000000" ');
  const svgBuffer = Buffer.from(svgContent);

  for (const size of SIZES) {
    const outputPath = resolve(ICONS_DIR, `icon-${size}.png`);
    await generateIcon(svgBuffer, size, outputPath);
    console.log(`✓ icon-${size}.png (${size}x${size})`);
  }

  // Apple touch icon (180x180)
  const applePath = resolve(ROOT, "public/apple-touch-icon.png");
  await generateIcon(svgBuffer, 180, applePath);
  console.log("✓ apple-touch-icon.png (180x180)");

  // Favicon ICO (32x32)
  const faviconPath = resolve(ROOT, "public/favicon.ico");
  await generateIcon(svgBuffer, 32, faviconPath);
  console.log("✓ favicon.ico (32x32)");

  console.log("\nTodos os ícones gerados com sucesso!");
  console.log("Fundo: #C0DF16 (verde) | Ícone: #000000 (preto)");
}

main().catch((err) => {
  console.error("Erro ao gerar ícones:", err);
  process.exit(1);
});
