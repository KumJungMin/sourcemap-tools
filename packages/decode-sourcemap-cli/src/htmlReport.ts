
import fs from "fs";
import path from "path";
import type { DecodedResult } from "./types.js";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateHtmlReport(
  results: DecodedResult[],
  outputPath: string
): string {
  const rows = results
    .map((r, idx) => {
      const src = r.original.source ?? "N/A";
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
  <meta charset="utf-8" />
  <title>Sourcemap Error Report</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; background: #020617; color: #e5e7eb; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead { background: #111827; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #1f2937; vertical-align: top; }
    tr:nth-child(even) { background: #030712; }
    code { font-family: ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  </style>
</head>
<body>
  <h1>Sourcemap Error Report</h1>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Bundle Location</th>
        <th>Source Location</th>
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
