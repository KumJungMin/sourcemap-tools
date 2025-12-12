
import type { ErrorKind } from "./types.js";

/**
 * Classify error source by origin.
 *
 * Priority:
 * 1. App source (project code)
 * 2. Framework runtime (Vue / React / React DOM / Next.js / Nuxt.js)
 * 3. Other third-party libraries
 * 4. Unknown
 */


const FRAMEWORK_RUNTIME_PATTERNS: Array<{
  name: ErrorKind;
  pattern: RegExp;
}> = [
  // Nuxt (Vue 기반)
  { name: "nuxt", pattern: /node_modules\/nuxt\// },
  { name: "nuxt", pattern: /node_modules\/@nuxt\// },

  // Vue core
  { name: "vue", pattern: /node_modules\/@vue\// },
  { name: "vue", pattern: /node_modules\/vue\// },

  // Next.js (React 기반)
  { name: "next", pattern: /node_modules\/next\// },

  // React DOM (must be before react)
  { name: "react-dom", pattern: /node_modules\/react-dom\// },

  // React core
  { name: "react", pattern: /node_modules\/react\// },
];

export function classifyError(sourcePath?: string | null): ErrorKind {
  if (!sourcePath) return "unknown";

  // 1. Framework runtime
  const framework = FRAMEWORK_RUNTIME_PATTERNS.find(({ pattern }) =>
    pattern.test(sourcePath)
  );
  if (framework) return framework.name;

  // 2. Other third-party libraries
  if (sourcePath.includes("node_modules/")) {
    return "library";
  }

  // 3. App source (everything else)
  return "app";
}

