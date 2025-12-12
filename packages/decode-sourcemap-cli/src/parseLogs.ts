
import type { TargetLocation } from "./types.js";

/** 
 * Extract error locations from log lines.
 * - Scans each line for patterns like "filename.js:line:column".
 * - Returns an array of TargetLocation objects for all matches found.
 * */ 
export function extractErrorLocations(lines: string[]): TargetLocation[] {
  const regex = /([\w.-]+\.js):(\d+):(\d+)/;
  const results: TargetLocation[] = [];

  for (const line of lines) {
    const match = line.match(regex);
    if (!match) continue;

    results.push({
      file: match[1],
      line: Number(match[2]),
      column: Number(match[3]),
    });
  }

  return results;
}
