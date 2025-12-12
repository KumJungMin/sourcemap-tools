import chalk from "chalk";
import type { DecodedResult } from "./types.js";

let USE_COLOR = true;
let RAW_MODE = false;

export function setUseColor(v: boolean) {
  USE_COLOR = v;
}

export function setRawMode(v: boolean) {
  RAW_MODE = v;
}

function c(text: string, fn: (s: string) => string): string {
  return USE_COLOR ? fn(text) : text;
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
      return c(" APP ", (s) => chalk.bgGreen.black(s));
    case "vue-runtime":
      return c(" VUE ", (s) => chalk.bgYellow.black(s));
    case "react-runtime":
      return c(" REACT ", (s) => chalk.bgMagenta.black(s));
    case "library":
      return c(" LIB ", (s) => chalk.bgBlue.black(s));
    default:
      return c(" ??? ", (s) => chalk.bgGray.black(s));
  }
}

export function printResult(result: DecodedResult, index: number) {
  if (RAW_MODE) {
    const src = result.original.source ?? "N/A";
    const line = result.original.line ?? "N/A";
    const col = result.original.column ?? "N/A";
    console.log(
      `${index}. ${result.file}:${result.line}:${result.column} -> ${src}:${line}:${col} (${result.kind})`
    );
    return;
  }

  console.log(c("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", (s) => chalk.yellow(s)));
  console.log(
    c(`#${index} Decoded Location`, (s) => chalk.bold.white(s)) + "  " + kindLabel(result.kind)
  );

  console.log("");
  console.log(c("Hashed bundle position:", (s) => chalk.white(s)));
  console.log(
    "  " +
      c(`${result.file}:${result.line}:${result.column}`, (s) => chalk.cyan(s))
  );

  const srcFile = shortenPath(result.original.source ?? undefined);
  const srcLine = result.original.line ?? "N/A";
  const srcCol = result.original.column ?? "N/A";

  console.log("");
  console.log(c("Original source:", (s) => chalk.white(s)));
  console.log("  file      " + c(srcFile, (s) => chalk.cyan(s)));
  console.log("  line      " + c(String(srcLine), (s) => chalk.cyan(s)));
  console.log("  column    " + c(String(srcCol), (s) => chalk.cyan(s)));
  console.log("");

  if (result.original.source && result.original.line && result.original.column) {
    const clickLine = `${shortenPath(result.original.source)}:${result.original.line}:${result.original.column}`;
    console.log(c("Open in editor:", (s) => chalk.white(s)));
    console.log("  " + clickLine);
    console.log("");
  }

  console.log(c("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", (s) => chalk.yellow(s)));
}
