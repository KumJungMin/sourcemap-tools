import { SourceMapConsumer, RawSourceMap } from "source-map-js";
import fs from "fs";
import path from "path";
import type { DecodedResult, TargetLocation, OriginalPosition } from "./types.js";
import { classifyError } from "./classify.js";

function resolveJsPath(dist: string, file: string): string | null {
  const baseName = path.basename(file);
  const candidates = [
    path.join(dist, file),
    path.join(dist, baseName),
    path.join(dist, "assets", baseName),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function resolveMapPath(jsPath: string): string | null {
  const candidates = [
    jsPath + ".map",
    jsPath.replace(/\.js$/, ".js.map"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function decodeOne(
  dist: string,
  target: TargetLocation,
): Promise<DecodedResult> {
  const jsPath = resolveJsPath(dist, target.file);

  if (!jsPath) {
    return {
      file: target.file,
      line: target.line,
      column: target.column,
      original: {
        source: null,
        line: null,
        column: null,
        name: null,
      },
      kind: "unknown",
    };
  }

  const mapPath = resolveMapPath(jsPath);

  if (!mapPath) {
    return {
      file: target.file,
      line: target.line,
      column: target.column,
      original: {
        source: null,
        line: null,
        column: null,
        name: null,
      },
      kind: "unknown",
    };
  }

  const rawMapText = fs.readFileSync(mapPath, "utf8");
  const rawMap = JSON.parse(rawMapText) as RawSourceMap;

  const consumer = await new SourceMapConsumer(rawMap);
  
  const pos = consumer.originalPositionFor({
    line: target.line,
    column: target.column,
  });

  const original: OriginalPosition = {
    source: pos.source ?? null,
    line: pos.line ?? null,
    column: pos.column ?? null,
    name: pos.name ?? null,
  };

  const kind = classifyError(original.source ?? undefined);

  return {
    file: target.file,
    line: target.line,
    column: target.column,
    original,
    kind,
  };
}

export async function decodeMany(
  dist: string,
  targets: TargetLocation[],
): Promise<DecodedResult[]> {
  const results: DecodedResult[] = [];
  for (const t of targets) {
    results.push(await decodeOne(dist, t));
  }
  return results;
}
