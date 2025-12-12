
import type { TargetLocation } from "./types.js";

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
