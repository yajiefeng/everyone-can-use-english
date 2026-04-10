# Environment Persistence Implementation Plan

> Execute this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking progress.

**Goal:** Persist the local development environment so installs and common root commands use Node 22, Python 3.11, and the Electron mirror without repeated manual exports.

**Architecture:** Store install-time defaults in a root `.npmrc`, add a reusable shell helper that resolves local tool paths, and wrap root workspace commands through that helper. Document the workflow in the root README so contributors start from the repository root.

**Tech Stack:** Yarn 4 workspaces, npm config environment propagation, POSIX shell, Homebrew toolchain

---

### Task 1: Persist install-time defaults

**Files:**
- Create: `.npmrc`

- [ ] **Step 1: Write the config file**

```ini
python=/opt/homebrew/opt/python@3.11/bin/python3.11
electron_mirror=https://npmmirror.com/mirrors/electron/
```

- [ ] **Step 2: Verify the file contents**

Run: `read .npmrc`
Expected: both `python=` and `electron_mirror=` lines are present.

### Task 2: Add a reusable environment helper

**Files:**
- Create: `scripts/setup-env.sh`

- [ ] **Step 1: Write the helper script**

```sh
#!/bin/sh

if [ -x /opt/homebrew/opt/node@22/bin/node ]; then
  export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
fi

if [ -z "${npm_config_python:-}" ] && [ -x /opt/homebrew/opt/python@3.11/bin/python3.11 ]; then
  export npm_config_python="/opt/homebrew/opt/python@3.11/bin/python3.11"
fi

if [ -z "${ELECTRON_MIRROR:-}" ]; then
  export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
fi
```

- [ ] **Step 2: Make the helper executable**

Run: `chmod +x scripts/setup-env.sh`
Expected: `scripts/setup-env.sh` is executable.

### Task 3: Route root commands through the helper

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add wrapper scripts**

```json
{
  "scripts": {
    "env:check": "sh -lc '. ./scripts/setup-env.sh && echo NODE=$(node -v) && echo PYTHON=$npm_config_python && echo ELECTRON_MIRROR=$ELECTRON_MIRROR'",
    "enjoy:dev": "sh -lc '. ./scripts/setup-env.sh && yarn workspace enjoy dev'",
    "enjoy:start": "sh -lc '. ./scripts/setup-env.sh && yarn workspace enjoy start'",
    "enjoy:test": "sh -lc '. ./scripts/setup-env.sh && yarn workspace enjoy test'"
  }
}
```

- [ ] **Step 2: Keep the remaining existing workspace commands unchanged**

Run: `read package.json`
Expected: the existing script set is still present, with the wrapped commands updated and `env:check` added.

### Task 4: Document the root workflow

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a local development section**

```md
## 本地开发

建议在仓库根目录执行命令：

```bash
yarn install
yarn env:check
yarn enjoy:start
```

仓库默认使用：
- Node 22（见 `.nvmrc`）
- Python 3.11（见 `.npmrc`）
- Electron 国内镜像（见 `.npmrc`）
```

- [ ] **Step 2: Verify the README update**

Run: `read README.md`
Expected: the local development section appears near the desktop app instructions.

### Task 5: Verify the persisted environment

**Files:**
- Test: `.npmrc`
- Test: `scripts/setup-env.sh`
- Test: `package.json`
- Test: `README.md`

- [ ] **Step 1: Check the wrapped environment**

Run: `cd /Users/fengyajie/github/everyone-can-use-english && yarn env:check`
Expected:
- `NODE=v22...`
- `PYTHON=/opt/homebrew/opt/python@3.11/bin/python3.11`
- `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/`

- [ ] **Step 2: Re-run install using persisted settings**

Run: `cd /Users/fengyajie/github/everyone-can-use-english && yarn install`
Expected: install completes with exit code 0.
