#!/usr/bin/env node
import minimist from "minimist";
import path from "path";

import { selectApp } from "./selectApp.js";
import { inputLogs } from "./inputLogs.js";
import { extractErrorLocations } from "./parseLogs.js";
import { decodeMany } from "./decode.js";
import { printResult } from "./printer.js";
import { generateHtmlReport } from "./htmlReport.js";
import { loadConfig } from "./config.js";
import type { AppConfigEntry, SourcemapToolsConfig } from "./config.js";

/**
 * CLI options accepted from command line arguments.
 *
 * - dist   : Explicit build output directory (highest priority)
 * - config : Path to sourcemap.config.json
 * - app    : App name to select when using config
 * - html   : Generate HTML report
 */
interface CliOptions {
  dist?: string;
  config?: string;
  app?: string;
  html?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                                    Entry                                   */
/* -------------------------------------------------------------------------- */

main().catch((err) => {
  console.error("❌ Unexpected error in CLI:", err);
  process.exit(1);
});

/**
 * CLI entry point.
 *
 * Flow:
 * 1. Parse CLI options
 * 2. Resolve target dist directory
 * 3. Accept pasted error logs
 * 4. Extract minified locations
 * 5. Decode sourcemaps
 * 6. Print results
 * 7. (Optional) Generate HTML report
 */
async function main() {
  const argv = minimist(process.argv.slice(2));
  const options = normalizeCliOptions(argv);

  console.log("");
  console.log("🔍 decode-sourcemap-cli");
  console.log("------------------------");

  const cwd = process.cwd();

  // Resolve build output directory
  const { dist, appName } = await resolveTarget(cwd, options);

  console.log(`📦 App: ${appName}`);
  console.log(`📂 Dist: ${dist}`);
  console.log("");

  // Read pasted logs
  const lines = await inputLogs();
  if (lines.length === 0) {
    console.log("No logs provided. Exit.");
    return;
  }

  // Extract "xxx.js:line:column" patterns
  const targets = extractErrorLocations(lines);
  if (targets.length === 0) {
    console.log("No valid error locations found in logs.");
    return;
  }

  // Decode sourcemaps
  const results = await decodeMany(dist, targets);

  // Print decoded results
  results.forEach((r, index) => {
    printResult(r, index + 1);
  });

  // Optional HTML report
  if (options.html) {
    const outPath = generateHtmlReport(results, options.html);
    console.log(`\n📄 HTML report generated at: ${outPath}`);
  }

  console.log("");
}

/* -------------------------------------------------------------------------- */
/*                               Option Helpers                                */
/* -------------------------------------------------------------------------- */

/**
 * Normalize raw minimist argv into typed CLI options.
 * Acts as a whitelist for supported flags.
 */
function normalizeCliOptions(args: minimist.ParsedArgs): CliOptions {
  return {
    dist: typeof args.dist === "string" ? args.dist : undefined,
    app: typeof args.app === "string" ? args.app : undefined,
    config: typeof args.config === "string" ? args.config : undefined,
    html: typeof args.html === "string" ? args.html : null,
  };
}

/* -------------------------------------------------------------------------- */
/*                           Config-based App Select                           */
/* -------------------------------------------------------------------------- */

/**
 * Select target app from sourcemap.config.json.
 *
 * Rules:
 * - If --app is provided, select matching app
 * - If only one app exists, auto-select
 * - Otherwise, prompt user
 *
 * distPath defaults to "dist" if not defined.
 */
async function selectAppFromConfig(
  config: SourcemapToolsConfig,
  options: CliOptions,
  cwd: string
): Promise<{ dist: string; appName: string }> {
  const apps = config.apps;

  if (!apps || apps.length === 0) {
    throw new Error("No apps defined in sourcemap.config.json");
  }

  let selected: AppConfigEntry | undefined;

  if (options.app) {
    selected = apps.find((a) => a.name === options.app);
    if (!selected) {
      throw new Error(
        `App '${options.app}' not found. Available: ${apps
          .map((a) => a.name)
          .join(", ")}`
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
          name: a.name,
          value: a.name,
        })),
      },
    ]);

    selected = apps.find((a) => a.name === appName)!;
  }

  const distPath = selected.distPath ?? "dist";

  return {
    appName: selected.name,
    dist: path.resolve(cwd, distPath),
  };
}

/* -------------------------------------------------------------------------- */
/*                             Target Resolution                               */
/* -------------------------------------------------------------------------- */

/**
 * Resolve build output directory to decode sourcemaps from.
 *
 * Priority:
 * 1. --dist option
 * 2. sourcemap.config.json
 * 3. Fallback auto-discovery (turborepo /apps)
 */
async function resolveTarget(
  cwd: string,
  options: CliOptions
): Promise<{ dist: string; appName: string }> {
  // 1) Explicit dist path
  if (options.dist) {
    return {
      dist: path.resolve(cwd, options.dist),
      appName: options.app ?? "app",
    };
  }

  // 2) Config-based multi app
  const config = loadConfig(cwd, options.config ?? null);
  if (config) {
    return await selectAppFromConfig(config, options, cwd);
  }

  // 3) Fallback auto-discovery
  const fallback = await selectApp();
  return {
    appName: fallback.appName,
    dist: path.join(fallback.appRoot, "dist"), // assume /dist
  };
}
