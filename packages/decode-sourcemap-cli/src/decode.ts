
import { SourceMapConsumer } from "source-map-js";
import fs from "fs";
import path from "path";
import type { DecodedResult, TargetLocation } from "./types.js";
import { classifyError } from "./classify.js";

function resolveJsPath(dist: string, file: string): string | null {
  const candidates = [
    path.join(dist, file),
    path.join(dist, "assets", file),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function decodeOne(
  dist: string,
  target: TargetLocation,
  projectRoot: string
): Promise<DecodedResult> {
  const jsPath = resolveJsPath(dist, target.file);

  if (!jsPath) {
    return {
      file: target.file,
      line: target.line,
      column: target.column,
      original: { source: null, line: null, column: null, name: null },
      kind: "unknown",
    };
  }

  const mapPath = jsPath + ".map";
  if (!fs.existsSync(mapPath)) {
    return {
      file: target.file,
      line: target.line,
      column: target.column,
      original: { source: null, line: null, column: null, name: null },
      kind: "unknown",
    };
  }

  const rawMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
  const consumer = await new SourceMapConsumer(rawMap);
  const pos = consumer.originalPositionFor({
    line: target.line,
    column: target.column,
  });

  const kind = classifyError(pos.source ?? undefined);

  return {
    file: target.file,
    line: target.line,
    column: target.column,
    original: {
      source: pos.source,
      line: pos.line,
      column: pos.column,
      name: pos.name,
    },
    kind,
  };
}

export async function decodeMany(
  dist: string,
  targets: TargetLocation[],
  projectRoot: string
): Promise<DecodedResult[]> {
  const results: DecodedResult[] = [];
  for (const t of targets) {
    results.push(await decodeOne(dist, t, projectRoot));
  }
  return results;
}
