import chalk from "chalk";
import type { DecodedResult } from "./types.js";

/** 
 * Print decoded result to console.
 * - Supports both raw and formatted output modes.
 * - In raw mode, outputs a single line per result.
 * - In formatted mode, provides detailed, colorized output.
 * */ 
export function printResult(result: DecodedResult, index: number) {
  console.log(color("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", (s) => chalk.yellow(s)));
  console.log(
    color(`#${index} Decoded Location`, (s) => chalk.bold.white(s)) + "  " + kindLabel(result.kind)
  );

  console.log("");
  console.log(color("Hashed bundle position:", (s) => chalk.white(s)));
  console.log(
    "  " +
      color(`${result.file}:${result.line}:${result.column}`, (s) => chalk.cyan(s))
  );

  const srcFile = shortenPath(result.original.source ?? undefined);
  const srcLine = result.original.line ?? "N/A";
  const srcCol = result.original.column ?? "N/A";

  console.log("");
  console.log(color("Original source:", (s) => chalk.white(s)));
  console.log("  file      " + color(srcFile, (s) => chalk.cyan(s)));
  console.log("  line      " + color(String(srcLine), (s) => chalk.cyan(s)));
  console.log("  column    " + color(String(srcCol), (s) => chalk.cyan(s)));
  console.log("");

  if (result.original.source && result.original.line && result.original.column) {
    const clickLine = `${shortenPath(result.original.source)}:${result.original.line}:${result.original.column}`;
    console.log(color("Open in editor:", (s) => chalk.white(s)));
    console.log("  " + clickLine);
    console.log("");
  }

  console.log(color("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", (s) => chalk.yellow(s)));
}

function color(text: string, fn: (s: string) => string): string {
  return fn(text);
}

function shortenPath(p?: string | null): string {
  if (!p) return "N/A";

  const nodeIdx = p.indexOf("node_modules");
  if (nodeIdx !== -1) return p.slice(nodeIdx);

  const srcIdx = p.indexOf("src/");
  if (srcIdx !== -1) return p.slice(srcIdx);

  return p.replace(/^((\.\.)\/)+/, "");
}

function kindLabel(kind: DecodedResult["kind"]): string {
  switch (kind) {
    case "app":
      return color(" APP ", (s) => chalk.bgGreen.black(s));
    case "vue":
      return color(" VUE ", (s) => chalk.bgYellow.black(s));
    case "nuxt":
      return color(" NUXT ", (s) => chalk.bgCyan.black(s));
    case "react":
      return color(" REACT ", (s) => chalk.bgMagenta.black(s));
    case "react-dom":
      return color(" REACT-DOM ", (s) => chalk.bgMagenta.black(s));
    case "next":
      return color(" NEXT ", (s) => chalk.bgBlue.black(s));
    case "library":
      return color(" LIB ", (s) => chalk.bgBlue.black(s));
    default:
      return color(" ??? ", (s) => chalk.bgGray.black(s));
  }
}