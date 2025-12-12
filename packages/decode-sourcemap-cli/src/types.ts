
export type ErrorKind = "app" | "vue-runtime" | "library" | "unknown" | "react-runtime";

export interface OriginalPosition {
  source: string | null;
  line: number | null;
  column: number | null;
  name?: string | null;
}

export interface DecodedResult {
  file: string;
  line: number;
  column: number;
  original: OriginalPosition;
  kind: ErrorKind;
}

export interface TargetLocation {
  file: string;
  line: number;
  column: number;
}
