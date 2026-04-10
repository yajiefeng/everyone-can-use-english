# One-Click Enjoy Dev Startup Implementation Plan

> Execute this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking progress.

**Goal:** Add a one-click script that prepares the local environment, installs dependencies when missing, and launches the Enjoy desktop app in dev mode from the repository root.

**Architecture:** Keep the environment setup in `scripts/setup-env.sh`, add a focused launcher script that reuses it, and expose the launcher through a root `package.json` alias. Update the README so contributors can use either the shell script or the Yarn alias.

**Tech Stack:** Yarn 4 workspaces, POSIX shell, Homebrew-based local toolchain

---

### Task 1: Add the one-click launcher

**Files:**
- Create: `scripts/dev-enjoy.sh`

- [ ] **Step 1: Write the launcher script**

```sh
#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

. ./scripts/setup-env.sh

if [ ! -d node_modules ] || [ ! -d enjoy/node_modules ]; then
  echo "Dependencies missing, running yarn install..."
  yarn install
fi

exec yarn enjoy:dev
```

- [ ] **Step 2: Make the launcher executable**

Run: `chmod +x scripts/dev-enjoy.sh`
Expected: `scripts/dev-enjoy.sh` is executable.

### Task 2: Add a Yarn alias

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the alias script**

```json
{
  "scripts": {
    "oneclick:dev": "./scripts/dev-enjoy.sh"
  }
}
```

- [ ] **Step 2: Verify the alias is present**

Run: `node -p "require('./package.json').scripts['oneclick:dev']"`
Expected: `./scripts/dev-enjoy.sh`

### Task 3: Document the new entrypoint

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the local development commands**

```md
建议在仓库根目录执行命令：

```bash
yarn install
yarn env:check
./scripts/dev-enjoy.sh
```

也可以使用：

```bash
yarn oneclick:dev
```
```

- [ ] **Step 2: Verify the README text**

Run: `read README.md`
Expected: the one-click script and `yarn oneclick:dev` appear in the local development section.

### Task 4: Verify the one-click flow

**Files:**
- Test: `scripts/dev-enjoy.sh`
- Test: `package.json`
- Test: `README.md`

- [ ] **Step 1: Verify the script path and alias**

Run: `cd /Users/fengyajie/github/everyone-can-use-english && ls -l scripts/dev-enjoy.sh && yarn oneclick:dev --help >/dev/null 2>&1 || true`
Expected: the script exists and is executable; the alias resolves to the launcher.

- [ ] **Step 2: Verify the install check branch without launching Electron**

Run: `cd /Users/fengyajie/github/everyone-can-use-english && sh -n scripts/dev-enjoy.sh`
Expected: shell syntax check passes with exit code 0.
