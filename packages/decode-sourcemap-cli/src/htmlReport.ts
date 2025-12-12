import fs from "fs";
import path from "path";
import type { DecodedResult } from "./types.js";
import { resolveDisplaySource } from "./printer.js";


/** 
 * Generate an HTML report from decoded results.
 * - The report includes a table with bundle positions, original sources, and error kinds.
 * - The generated HTML file is saved to the specified output path.
 * */ 
export function generateHtmlReport(
  results: DecodedResult[],
  outputPath: string,
  appRoot: string
): string {
  const rows = results
    .map((r, idx) => {
      const resolvedSource = resolveDisplaySource(r.original.source, appRoot);
      const src = resolvedSource
        ? path.relative(appRoot, resolvedSource)
        : "N/A";
      const line = r.original.line ?? "N/A";
      const col = r.original.column ?? "N/A";

      return `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(`${r.file}:${r.line}:${r.column}`)}</td>
        <td>${escapeHtml(`${src}:${line}:${col}`)}</td>
        <td>${escapeHtml(r.kind)}</td>
      </tr>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>decode-sourcemap-cli report</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #0f172a;
        color: #e5e7eb;
        padding: 24px;
      }
      h1 {
        font-size: 20px;
        margin-bottom: 16px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #020617;
        border-radius: 12px;
        overflow: hidden;
      }
      th, td {
        padding: 8px 12px;
        font-size: 13px;
      }
      th {
        background: #111827;
        text-align: left;
      }
      tr:nth-child(even) td {
        background: #020617;
      }
      tr:nth-child(odd) td {
        background: #030712;
      }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }
    </style>
  </head>
  <body>
    <h1>decode-sourcemap-cli report</h1>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Bundle position</th>
          <th>Original source</th>
          <th>Kind</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
</html>`;

  const abs = path.resolve(process.cwd(), outputPath);
  fs.writeFileSync(abs, html, "utf8");
  return abs;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
