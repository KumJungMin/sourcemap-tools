import fs from "fs";
import path from "path";

export interface AppConfigEntry {
  /** Logical name shown in the selector (e.g. "web") */
  name: string;
  /** Optional app root path (for future use / editor integration) */
  appPath?: string;
  /** Build output directory that contains JS bundles & sourcemaps */
  distPath: string;
}

export interface SourcemapToolsConfig {
  apps: AppConfigEntry[];
}

const DEFAULT_CONFIG_NAME = "sourcemap.config.json";

export function loadConfig(cwd: string, explicitPath?: string | null): SourcemapToolsConfig | null {
  const candidates: string[] = [];

  if (explicitPath) {
    candidates.push(path.resolve(cwd, explicitPath));
  } else {
    candidates.push(path.join(cwd, DEFAULT_CONFIG_NAME));
  }

  for (const file of candidates) {
    if (!file) continue;
    if (!fs.existsSync(file)) continue;

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
