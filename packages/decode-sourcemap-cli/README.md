# decode-sourcemap-cli

**decode-sourcemap-cli** is a local CLI tool that converts production minified error stack traces back into original source locations using sourcemaps — **fully offline**, without any backend server.

It is designed for environments where **frontend debugging must happen locally**, using only build artifacts.

<br/>

## 1. Purpose — Why This Tool Exists

### 🏦 Background

Some environments operate under strict infrastructure or security constraints, such as:

- Financial institutions
- Government systems
- Internal corporate networks
- Intranet-only or isolated environments

In these setups, the following are often **not allowed**:

- ❌ Uploading `.map` files to a server
- ❌ Using external error monitoring services (Sentry, Datadog, etc.)
- ❌ Sending frontend logs outside the local machine
- ❌ Running backend APIs for sourcemap decoding

As a result, production errors often look like this:

```
at ExampleComponent-Cq_iF_Ko.js:1:120
at index-CWMXbtJ-.js:13:38
```

From this alone, developers cannot know:

- Which original `.vue` / `.tsx` file caused the error
- The real line and column number
- Whether the issue is in app code, framework code, or a library

Debugging becomes slow, manual, and error-prone.

<br/>

### 🎯 Goal

`decode-sourcemap-cli` exists to solve this exact problem.

It enables:

- ✔️ Sourcemap decoding entirely on the developer machine
- ✔️ No backend server
- ✔️ No network access
- ✔️ No external services
- ✔️ Debugging using only local build outputs (`dist/*.js`, `*.map`)

> **This tool turns your local machine into a safe, offline debugging environment for production errors.**

<br/>

## 2. How Developers Use This Tool When an Error Occurs

A typical workflow looks like this:

1. Build the application locally (so you have JS bundles and sourcemaps).
2. Copy the error stack trace from the browser console or log output.
3. Run the CLI (`dsm`) and paste the logs when prompted.
4. The CLI locates the corresponding `.map` files and decodes the stack trace.

The decoded result includes:

- Original source file path
- Line and column number
- Error classification (app / framework / library)
- Clickable file paths in the terminal
- Optional HTML report for sharing

<br/>

## 3. Installation (Recommended)

The easiest and recommended way is to install it as a **dev dependency** and run via `npx`.

```bash
npm add -D decode-sourcemap-cli
# or
pnpm add -D decode-sourcemap-cli
```

Run:

```bash
npx dsm
```

No global installation is required.

<br/>

## 4. CLI Workflow (Step by Step)

### ▶ Step 1: Run the CLI

```bash
npx dsm
```

<img src="https://github.com/KumJungMin/sourcemap-tools/blob/main/docs/image/step1-select-app.png" style="border: 1px solid"/>

### ▶ Step 2: Select target app (if applicable)

If multiple apps are detected (e.g. monorepo), you will be prompted to select one.

<img src="https://github.com/KumJungMin/sourcemap-tools/blob/main/docs/image/step2-select-app.png" style="border: 1px solid"/>
 
### ▶ Step 3: Build output (`dist`) is resolved automatically

The CLI determines the correct build output directory.

<img src="https://github.com/KumJungMin/sourcemap-tools/blob/main/docs/image/step3-select-app.png" style="border: 1px solid"/>

### ▶ Step 4: Paste production error logs

Paste the stack trace exactly as it appears in the browser or log output.

<img src="https://github.com/KumJungMin/sourcemap-tools/blob/main/docs/image/step4-select-app.png" style="border: 1px solid"/>

### ▶ Step 5: View decoded result

Minified positions are converted back into original source locations.

<img src="https://github.com/KumJungMin/sourcemap-tools/blob/main/docs/image/step5-select-app.png" style="border: 1px solid"/>

### ▶ Step 6: Jump directly to the error location

Paths are printed in a format that allows **Command + Click** (or Ctrl + Click).

<img src="https://github.com/KumJungMin/sourcemap-tools/blob/main/docs/image/step6-select-app.png" style="border: 1px solid"/>

<br/>

## 5. CLI Options

| Option | Description |
|------|-------------|
| `--html <file>` | Export decoded results as an HTML report |

Example:

```bash
npx dsm --html report.html
```

<br/>

## 6. Usage Guides by Project Structure

This project provides guides for:

- <a href="https://github.com/KumJungMin/sourcemap-cli-test/tree/single-app">Single App (no config)</a>
- <a href="https://github.com/KumJungMin/sourcemap-cli-test/tree/custom-single-app">Single App + `sourcemap.config.json`</a>
- <a href="https://github.com/KumJungMin/sourcemap-cli-test/tree/multi-app">Turborepo / Multi-app monorepo</a>

Each guide explains how the CLI resolves apps and build outputs.

<br/>

## 7. Why This Tool Fits Restricted Network Environments

| Constraint | Typical Problem | Solution |
|-----------|----------------|----------|
| No backend APIs | Cannot decode server-side | Decode locally |
| No external network | SaaS unavailable | Zero network usage |
| Security compliance | Source exposure risk | Everything stays local |

<br/>

## 8. Summary

`decode-sourcemap-cli` provides:

- 🔒 100% offline sourcemap decoding
- 🧭 Clear, readable error locations
- 📂 Clickable navigation to source files
- 📝 Optional HTML reporting
- 🏗️ Support for single-app and monorepo setups
