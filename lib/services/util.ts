const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

// Short, human-typable, ambiguity-free join code.
export function genCode(len = 8): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Reject with a tagged `TIMEOUT` error if `promise` doesn't settle within `ms`.
 * Lets a server action fail fast with an actionable message (via `fromError`)
 * instead of leaving the UI stuck "pending" when a network/database call hangs.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error("Permintaan memakan waktu terlalu lama."), { code: "TIMEOUT" }));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// URL-safe slug + short random suffix so duplicate titles stay unique within a class-subject.
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "tugas"}-${genCode(4).toLowerCase()}`;
}
