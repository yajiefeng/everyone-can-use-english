const { existsSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const start = require('../enjoy/node_modules/@electron-forge/core/dist/api/start').default;

const rootDir = path.resolve(__dirname, '..');
const enjoyDir = path.join(rootDir, 'enjoy');

process.chdir(rootDir);

if (existsSync('/opt/homebrew/opt/node@22/bin/node')) {
  process.env.PATH = `/opt/homebrew/opt/node@22/bin:${process.env.PATH || ''}`;
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
    process.exit(install.status || 1);
  }
}

process.chdir(enjoyDir);

(async () => {
  const child = await start({
    dir: enjoyDir,
    interactive: true,
  });

  if (process.env.ENJOY_LAUNCHER_DEBUG) {
    console.error('[dev-enjoy] spawned electron pid=%s file=%s', child && child.pid, child && child.spawnfile);
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
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
