# Stable Enjoy Dev Launcher Implementation Plan

> Execute this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking progress.

**Goal:** Replace the brittle CLI-based one-click dev launcher with a Node-based launcher that prepares the environment, installs dependencies if needed, and starts Enjoy dev mode through `@electron-forge/core` directly.

**Architecture:** Keep `scripts/setup-env.sh` as the environment source of truth, add a new `scripts/dev-enjoy.mjs` launcher that mirrors the shell behavior and calls Forge's `start()` API, and reduce `scripts/dev-enjoy.sh` to a thin wrapper. Preserve `yarn oneclick:dev` and README usage so the user-facing workflow stays unchanged.

**Tech Stack:** Node.js ESM, Yarn 4 workspaces, POSIX shell, `@electron-forge/core`

---

### Task 1: Add the core-API launcher

**Files:**
- Create: `scripts/dev-enjoy.mjs`

- [ ] **Step 1: Write the launcher**

```js
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import start from '../enjoy/node_modules/@electron-forge/core/dist/api/start.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const enjoyDir = path.join(rootDir, 'enjoy');

process.chdir(rootDir);

if (existsSync('/opt/homebrew/opt/node@22/bin/node')) {
  process.env.PATH = `/opt/homebrew/opt/node@22/bin:${process.env.PATH}`;
}

if (!process.env.npm_config_python && existsSync('/opt/homebrew/opt/python@3.11/bin/python3.11')) {
  process.env.npm_config_python = '/opt/homebrew/opt/python@3.11/bin/python3.11';
}

if (!process.env.ELECTRON_MIRROR) {
  process.env.ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/';
}

if (!existsSync(path.join(rootDir, 'node_modules')) || !existsSync(path.join(enjoyDir, 'node_modules'))) {
  console.log('Dependencies missing, running yarn install...');
  const install = spawnSync('yarn', ['install'], { cwd: rootDir, stdio: 'inherit', env: process.env });
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

const child = await start({ dir: enjoyDir, interactive: true });

await new Promise((resolve, reject) => {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      reject(new Error(`Electron exited with code ${code}`));
      return;
    }
    resolve();
  });
  child.on('error', reject);
});
```

- [ ] **Step 2: Verify the file exists**

Run: `read scripts/dev-enjoy.mjs`
Expected: the launcher sets env vars, installs dependencies if needed, and calls Forge `start()` directly.

### Task 2: Convert the shell entrypoint into a thin wrapper

**Files:**
- Modify: `scripts/dev-enjoy.sh`

- [ ] **Step 1: Replace the shell body**

```sh
#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

. ./scripts/setup-env.sh

exec node ./scripts/dev-enjoy.mjs
```

- [ ] **Step 2: Keep the script executable**

Run: `chmod +x scripts/dev-enjoy.sh`
Expected: `scripts/dev-enjoy.sh` remains executable.

### Task 3: Preserve the existing alias

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Keep `oneclick:dev` pointing at the wrapper**

```json
{
  "scripts": {
    "oneclick:dev": "./scripts/dev-enjoy.sh"
  }
}
```

- [ ] **Step 2: Verify the alias value**

Run: `node -p "require('./package.json').scripts['oneclick:dev']"`
Expected: `./scripts/dev-enjoy.sh`

### Task 4: Keep README usage stable

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Ensure the README still advertises the same commands**

```md
./scripts/dev-enjoy.sh
```

and

```md
yarn oneclick:dev
```

- [ ] **Step 2: Verify the local development section**

Run: `read README.md`
Expected: the existing one-click usage remains documented without needing new user-facing commands.

### Task 5: Verify the stable launcher path

**Files:**
- Test: `scripts/dev-enjoy.mjs`
- Test: `scripts/dev-enjoy.sh`
- Test: `package.json`

- [ ] **Step 1: Syntax-check the launcher files**

Run: `cd /Users/fengyajie/github/everyone-can-use-english && node --check scripts/dev-enjoy.mjs && sh -n scripts/dev-enjoy.sh`
Expected: both commands exit 0.

- [ ] **Step 2: Verify actual Electron spawn in this environment**

Run: `cd /Users/fengyajie/github/everyone-can-use-english && NODE_OPTIONS="--require /tmp/trace-process.js" ./scripts/dev-enjoy.sh`
Expected: logs show a spawn of `.../node_modules/electron/dist/Electron.app/Contents/MacOS/Electron`, proving the launcher reaches real Electron startup instead of exiting after the Vite preStart phase.
