#!/usr/bin/env node
/**
 * Generate PWA icons from SVG sources using sharp
 * Run with: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Icon configurations
const icons = [
  // Standard icons
  { input: 'icon-512.svg', output: 'icon-192x192.png', size: 192 },
  { input: 'icon-512.svg', output: 'icon-512x512.png', size: 512 },
  // Maskable icons (for Android adaptive icons)
  { input: 'icon-maskable.svg', output: 'icon-maskable-192x192.png', size: 192 },
  { input: 'icon-maskable.svg', output: 'icon-maskable-512x512.png', size: 512 },
  // Apple touch icon (already exists but regenerate for consistency)
  { input: 'icon-512.svg', output: 'apple-touch-icon.png', size: 180 },
  // Favicon sizes
  { input: 'icon-512.svg', output: 'favicon-16x16.png', size: 16 },
  { input: 'icon-512.svg', output: 'favicon-32x32.png', size: 32 },
];

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  for (const icon of icons) {
    const inputPath = join(publicDir, icon.input);
    const outputPath = join(publicDir, icon.output);

    try {
      const svgBuffer = readFileSync(inputPath);

      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${icon.output} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.output}:`, error.message);
    }
  }

  console.log('\nDone! Icons generated in /public/');
}

generateIcons();
