#!/usr/bin/env node
import minimist from "minimist";
import path from "path";
import { selectApp } from "./selectApp.js";
import { inputLogs } from "./inputLogs.js";
import { extractErrorLocations } from "./parseLogs.js";
import { decodeMany } from "./decode.js";
import { printResult, setUseColor, setRawMode } from "./printer.js";
import { generateHtmlReport } from "./htmlReport.js";
import { loadConfig } from "./config.js";
import type { AppConfigEntry, SourcemapToolsConfig } from "./config.js";

interface CliOptions {
  dist?: string;
  app?: string;
  appPath?: string;
  config?: string;
  html?: string | null;
  noColor?: boolean;
  raw?: boolean;
}

function normalizeCliOptions(argv: minimist.ParsedArgs): CliOptions {
  return {
    dist: typeof argv.dist === "string" ? argv.dist : undefined,
    app: typeof argv.app === "string" ? argv.app : undefined,
    appPath: typeof argv.appPath === "string" ? argv.appPath : undefined,
    config: typeof argv.config === "string" ? argv.config : undefined,
    html: typeof argv.html === "string" ? argv.html : null,
    noColor: argv["no-color"] === true,
    raw: argv["raw"] === true,
  };
}

async function selectAppFromConfig(
  config: SourcemapToolsConfig,
  opts: CliOptions,
  cwd: string
): Promise<{ projectRoot: string; dist: string; appName: string }> {
  const apps = config.apps;

  if (!apps || apps.length === 0) {
    throw new Error("No apps defined in sourcemap.config.json");
  }

  let selected: AppConfigEntry | undefined;

  if (opts.app) {
    selected = apps.find((a) => a.name === opts.app);
    if (!selected) {
      throw new Error(
        `App '${opts.app}' not found. Available: ${apps.map((a) => a.name).join(", ")}`
      );
    }
  } else if (apps.length === 1) {
    selected = apps[0];
  }

  if (!selected) {
    const inquirer = (await import("inquirer")).default;

    const { appName } = await inquirer.prompt([
      {
        type: "list",
        name: "appName",
        message: "Select target app:",
        choices: apps.map((a) => ({
          name: `${a.name} (${a.distPath})`,
          value: a.name,
        })),
      },
    ]);

    selected = apps.find((a) => a.name === appName)!;
  }

  return {
    projectRoot: path.resolve(cwd, selected.appPath ?? "."),
    dist: path.resolve(cwd, selected.distPath),
    appName: selected.name,
  };
}

async function resolveTarget(cwd: string, opts: CliOptions): Promise<{ projectRoot: string; dist: string; appName: string }> {
  // 1) Highest priority: explicit --dist
  if (opts.dist) {
    const dist = path.resolve(cwd, opts.dist);
    const projectRoot = opts.appPath ? path.resolve(cwd, opts.appPath) : cwd;
    return { projectRoot, dist, appName: opts.app ?? "app" };
  }

  // 2) Config-based multi app (sourcemap.config.json)
  const config = loadConfig(cwd, opts.config ?? null);
  if (config) {
    return await selectAppFromConfig(config, opts, cwd);
  }

  // 3) Fallback: turborepo-style /apps auto discovery
  const fallback = await selectApp();
  return {
    projectRoot: fallback.root,
    dist: fallback.dist,
    appName: fallback.targetApp,
  };
}

async function main() {
  const argv = minimist(process.argv.slice(2));
  const opts = normalizeCliOptions(argv);

  if (opts.noColor) {
    setUseColor(false);
  }
  if (opts.raw) {
    setRawMode(true);
  }

  console.log("");
  console.log("🔍 decode-sourcemap-cli");
  console.log("------------------------");

  const cwd = process.cwd();

  // Resolve target build directory
  const { projectRoot, dist, appName } = await resolveTarget(cwd, opts);

  console.log(`📁 Project root: ${projectRoot}`);
  console.log(`📦 App: ${appName}`);
  console.log(`📂 Dist: ${dist}`);
  console.log("");

  // Input logs
  const lines = await inputLogs();
  if (lines.length === 0) {
    console.log("No logs provided. Exit.");
    return;
  }

  const targets = extractErrorLocations(lines);
  if (targets.length === 0) {
    console.log("No 'xxx.js:line:column' pattern found in logs.");
    return;
  }

  const results = await decodeMany(dist, targets);

  results.forEach((r, index) => {
    printResult(r, index + 1);
  });

  if (opts.html) {
    const outPath = generateHtmlReport(results, opts.html);
    console.log(`\n📄 HTML report generated at: ${outPath}`);
  }

  console.log("");
}

main().catch((err) => {
  console.error("❌ Unexpected error in CLI:", err);
  process.exit(1);
});
