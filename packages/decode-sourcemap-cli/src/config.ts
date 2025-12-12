import fs from "fs";
import path from "path";

/**
 * Single app entry definition inside `sourcemap.config.json`
 *
 * Each entry represents one build target that can be decoded by the CLI.
 * (ex: monorepo with multiple apps, or multiple build outputs)
 */
export interface AppConfigEntry {
  /** Logical app name */
  name: string;

  /** App root directory (e.g. apps/vue1) */
  appPath?: string;

  /** Build output directory (e.g. apps/vue1/dist) */
  distPath?: string;
}

/**
 * Root configuration shape for decode-sourcemap-cli.
 *
 * The CLI supports multiple apps in a single project,
 * each with its own build output directory.
 */
export interface SourcemapToolsConfig {
  /**
   * List of apps that can be selected in the CLI.
   */
  apps: AppConfigEntry[];
}

/**
 * Default config file name.
 *
 * The CLI will automatically look for this file
 * in the current working directory if no explicit path is provided.
 */
const DEFAULT_CONFIG_NAME = "sourcemap.config.json";

/**
 * Loads `sourcemap.config.json` from disk.
 *
 * Priority:
 * 1. Explicit config path provided via CLI option (`--config`)
 * 2. Default config file in the current working directory
 *
 * Returns:
 * - Parsed config object if valid
 * - `null` if no config is found or config is invalid
 */
export function loadConfig(
  cwd: string,
  explicitPath?: string | null
): SourcemapToolsConfig | null {
  const candidates: string[] = [];
  if (explicitPath) {
    candidates.push(path.resolve(cwd, explicitPath));
  } else {
    candidates.push(path.join(cwd, DEFAULT_CONFIG_NAME));
  }

  for (const file of candidates) {
    if (!file || !fs.existsSync(file)) continue;
    try {
      const raw = fs.readFileSync(file, "utf8");
      const json = JSON.parse(raw) as SourcemapToolsConfig;

      if (!json || !Array.isArray(json.apps) || json.apps.length === 0) {
        return null;
      }
      return json;
    } catch (e) {
      console.error(`⚠️  Failed to read config: ${file}`);
      console.error(e);
      return null;
    }
  }
  return null;
}
