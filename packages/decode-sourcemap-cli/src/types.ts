
export type ErrorKind =
  | "app"
  | "vue"
  | "nuxt"
  | "react"
  | "react-dom"
  | "next"
  | "library"
  | "unknown";


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


export interface DecodeOptions {
  strategy: "strict" | "filename";
}

export interface TargetLocation {
  file: string;
  line: number;
  column: number;
}
