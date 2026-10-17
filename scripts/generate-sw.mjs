#!/usr/bin/env node
/**
 * Generate public/sw.js from public/sw-template.js with a fresh build id.
 *
 * The service worker's own script bytes are what the browser's update
 * algorithm compares across visits. Substituting a fresh id into
 * CACHE_VERSION on every build guarantees those bytes change per deploy,
 * which is required for the browser to ever notice a new version.
 *
 * Run with: node scripts/generate-sw.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const templatePath = join(publicDir, 'sw-template.js');
const outputPath = join(publicDir, 'sw.js');

const buildId = Date.now().toString(36);

const template = readFileSync(templatePath, 'utf8');
const output = template.split('__SW_BUILD_ID__').join(buildId);

writeFileSync(outputPath, output);

console.log(`[generate-sw] Wrote ${outputPath} with build id ${buildId}`);
