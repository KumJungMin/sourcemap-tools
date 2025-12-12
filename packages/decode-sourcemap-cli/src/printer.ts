
import chalk from "chalk";
import type { DecodedResult } from "./types.js";

function shortenPath(p?: string | null): string {
  if (!p) return "N/A";

  const nodeIdx = p.indexOf("node_modules");
  if (nodeIdx !== -1) return p.slice(nodeIdx);

  const srcIdx = p.indexOf("src/");
  if (srcIdx !== -1) return p.slice(srcIdx);

  return p.replace(/^((\.\.)\/)+/, "");
}

function kindLabel(kind: DecodedResult["kind"]) {
  switch (kind) {
    case "app":
      return chalk.bgGreen.black(" APP ");
    case "vue-runtime":
      return chalk.bgYellow.black(" VUE ");
    case "react-runtime":
      return chalk.bgMagenta.black(" REACT ");
    case "library":
      return chalk.bgBlue.black(" LIB ");
    default:
      return chalk.bgGray.black(" ??? ");
  }
}

export function printResult(result: DecodedResult, index: number) {
  const srcPath = shortenPath(result.original.source);
  const srcLine = result.original.line ?? "N/A";
  const srcCol = result.original.column ?? "N/A";

  console.log(chalk.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(
    `${kindLabel(result.kind)} ` +
      chalk.bold(
        `#${index} ${result.file} (${result.line}:${result.column})`
      )
  );
  console.log();

  console.log(chalk.white("Source File:"));
  console.log("  " + chalk.green(srcPath));
  console.log();

  console.log(chalk.white("Location:"));
  console.log("  line      " + chalk.cyan(srcLine));
  console.log("  column    " + chalk.cyan(srcCol));
  console.log();


  if (result.original.source && result.original.line && result.original.column) {
    const clickLine = `${shortenPath(result.original.source)}:${result.original.line}:${result.original.column}`;
    console.log(chalk.white("Open in editor:"));
    console.log("  " + clickLine);
  }

  console.log(chalk.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
}
