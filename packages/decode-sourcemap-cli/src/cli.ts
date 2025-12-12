#!/usr/bin/env node
import minimist from "minimist";
import { selectApp } from "./selectApp.js";
import { inputLogs } from "./inputLogs.js";
import { extractErrorLocations } from "./parseLogs.js";
import { decodeMany } from "./decode.js";
import { printResult } from "./printer.js";
import { generateHtmlReport } from "./htmlReport.js";

async function main() {
  const argv = minimist(process.argv.slice(2));
  const htmlOut = typeof argv.html === "string" ? argv.html : null;

  console.log("");
  console.log("🔍 decode-sourcemap-cli");
  console.log("------------------------");

  const { root, targetApp, dist } = await selectApp();

  console.log(`\n📦 Selected app: ${targetApp}`);
  console.log(`📁 dist: ${dist}\n`);

  const logLines = await inputLogs();
  if (logLines.length === 0) {
    console.log("No logs provided. Exit.");
    return;
  }

  const targets = extractErrorLocations(logLines);
  if (targets.length === 0) {
    console.log("No locations found in logs.");
    return;
  }

  const results = await decodeMany(dist, targets, root);

  results.forEach((r, idx) => {
    printResult(r, idx + 1);
  });

  if (htmlOut) {
    const outPath = generateHtmlReport(results, htmlOut);
    console.log(`\n📄 HTML report generated at: ${outPath}`);
  }

  console.log("");
}

main().catch((err) => {
  console.error("❌ Unexpected error in CLI:", err);
  process.exit(1);
});
