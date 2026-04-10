import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import forgeStartModule from '../enjoy/node_modules/@electron-forge/core/dist/api/start.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const enjoyDir = path.join(rootDir, 'enjoy');

process.chdir(rootDir);

if (existsSync('/opt/homebrew/opt/node@22/bin/node')) {
  process.env.PATH = `/opt/homebrew/opt/node@22/bin:${process.env.PATH ?? ''}`;
}

if (!process.env.npm_config_python && existsSync('/opt/homebrew/opt/python@3.11/bin/python3.11')) {
  process.env.npm_config_python = '/opt/homebrew/opt/python@3.11/bin/python3.11';
}

if (!process.env.ELECTRON_MIRROR) {
  process.env.ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/';
}

if (!existsSync(path.join(rootDir, 'node_modules')) || !existsSync(path.join(enjoyDir, 'node_modules'))) {
  console.log('Dependencies missing, running yarn install...');
  const install = spawnSync('yarn', ['install'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  });

  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

const start = forgeStartModule?.default?.default ?? forgeStartModule?.default ?? forgeStartModule;

if (typeof start !== 'function') {
  throw new TypeError('Unable to resolve @electron-forge/core start() export');
}

process.chdir(enjoyDir);

const child = await start({
  dir: enjoyDir,
  interactive: true,
});

if (process.env.ENJOY_LAUNCHER_DEBUG) {
  console.error('[dev-enjoy] spawned electron pid=%s file=%s', child?.pid, child?.spawnfile);
}

await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', (code) => {
    if (code && code !== 0) {
      reject(new Error(`Electron exited with code ${code}`));
      return;
    }

    resolve();
  });
});
