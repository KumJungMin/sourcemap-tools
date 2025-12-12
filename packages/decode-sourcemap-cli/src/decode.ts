import { SourceMapConsumer, RawSourceMap } from "source-map-js";
import fs from "fs";
import path from "path";
import type {
  DecodedResult,
  TargetLocation,
  OriginalPosition
} from "./types.js";
import { classifyError } from "./classify.js";


/**
 * Decode a single error location using a sourcemap.
 *
 * Input:
 * - dist directory
 * - minified error location (file / line / column)
 *
 * Output:
 * - original source location (file / line / column / function name)
 * - error classification (app / library / framework runtime / unknown)
 *
 * This function never throws on missing files.
 * It always returns a DecodedResult to keep batch decoding stable.
 */
async function decodeOne(
  dist: string,
  target: TargetLocation,
): Promise<DecodedResult> {

  // Step 1: locate the JS bundle referenced in the error log
  const jsPath = resolveJsPath(dist, target.file);
  if (!jsPath) {
    // JS file not found → return fallback result
    return {
      file: target.file,
      line: target.line,
      column: target.column,
      original: { source: null, line: null, column: null, name: null },
      kind: "unknown",
    };
  }

  // Step 2: locate the corresponding sourcemap file
  const mapPath = resolveMapPath(jsPath);
  if (!mapPath) {
    // Sourcemap missing → cannot decode further
    return {
      file: target.file,
      line: target.line,
      column: target.column,
      original: { source: null, line: null, column: null, name: null },
      kind: "unknown",
    };
  }

  // Step 3: load and parse the raw sourcemap
  const rawMapText = fs.readFileSync(mapPath, "utf8");
  const rawMap = JSON.parse(rawMapText) as RawSourceMap;

  // Step 4: create a SourceMapConsumer to map positions
  const consumer = await new SourceMapConsumer(rawMap);

  // Step 5: map generated (minified) position → original source position
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

  // Step 6: classify error origin (app / library / framework runtime)
  const kind = classifyError(original.source ?? undefined);

  return {
    file: target.file,
    line: target.line,
    column: target.column,
    original,
    kind,
  };
}

/**
 * Decode multiple error locations in sequence.
 */
export async function decodeMany(
  dist: string,
  targets: TargetLocation[],
): Promise<DecodedResult[]> {

  const results: DecodedResult[] = [];

  for (const target of targets) {
    results.push(await decodeOne(dist, target));
  }
  return results;
}


/** 
 * resolveJsPath function
 * - find the JS bundle file in the dist directory
 *   e.g. dist/index-abc123.js, dist/index-abc123.js
 * */ 
function resolveJsPath(dist: string, file: string): string | null {
  const baseName = path.basename(file);

  const candidates = [
    path.join(dist, file),  // e.g. dist/index-xxx.js
    path.join(dist, baseName),  // e.g. dist/index-xxx.js (log only contains basename)
    path.join(dist, "assets", baseName),  // e.g. dist/assets/index-xxx.js
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * resolveMapPath function
 * - Resolve the sourcemap file path for a given JS bundle.
 *
 * Supports common sourcemap naming conventions:
 * - bundle.js.map
 * - bundle.js -> bundle.js.map
 */
function resolveMapPath(jsPath: string): string | null {
  const candidates = [jsPath + ".map", jsPath.replace(/\.js$/, ".js.map")];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}