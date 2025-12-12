
import type { ErrorKind } from "./types.js";

export function classifyError(sourcePath?: string | null): ErrorKind {
  if (!sourcePath) return "unknown";

  if (sourcePath.includes("node_modules/@vue/")) {
    return "vue-runtime";
  }

  if (sourcePath.includes("node_modules/")) {
    return "library";
  }

  if (sourcePath.includes("src/")) {
    return "app";
  }

  return "unknown";
}
