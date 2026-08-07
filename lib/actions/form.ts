// Small FormData coercers. Empty strings become `undefined` so `.optional()` Zod
// fields behave the way an untouched input should.

export function str(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

export function reqStr(v: FormDataEntryValue | null): string {
  return str(v) ?? "";
}

export function num(v: FormDataEntryValue | null): number | undefined {
  const s = str(v);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

export function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

/** Split a textarea (one item per line, or comma-separated) into a trimmed list. */
export function lines(v: FormDataEntryValue | null): string[] {
  if (v === null) return [];
  return String(v)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
