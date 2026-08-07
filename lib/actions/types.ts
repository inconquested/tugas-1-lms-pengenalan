import type { z } from "zod";

// The single result shape every Server Action returns, so forms can drive
// `useActionState` uniformly: render `errors` under fields and toast `message`.
export type ActionState = {
  ok: boolean;
  message?: string;
  /** Field-keyed validation messages from Zod. */
  errors?: Record<string, string[]>;
  /** Machine-readable failure code (Prisma P-code, `TIMEOUT`, …) for telemetry
   *  and client branching. Never itself shown to the user. */
  code?: string;
};

export const idle: ActionState = { ok: false };

export function ok(message?: string): ActionState {
  return { ok: true, message };
}

export function fail(
  message: string,
  errors?: Record<string, string[]>,
  code?: string,
): ActionState {
  return { ok: false, message, errors, code };
}

/** Turn a ZodError into the field-keyed `errors` map plus a summary message. */
export function fromZod(error: z.ZodError): ActionState {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (errors[key] ??= []).push(issue.message);
  }
  return { ok: false, message: "Periksa kembali isian formulir.", errors };
}

// Prisma error codes → safe, actionable Indonesian messages. Connection/timeout
// codes (P1xxx, P2024) carry a "try again" tone; the rest are stable outcomes the
// user can act on. Anything NOT listed here is treated as an opaque server fault so
// its raw message (which can embed the database URL or SQL) never reaches the client.
const PRISMA_MESSAGES: Record<string, string> = {
  P1000: "Autentikasi basis data gagal. Hubungi administrator.",
  P1001: "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.",
  P1002: "Server tidak merespons tepat waktu. Silakan coba lagi sebentar.",
  P1008: "Operasi memakan waktu terlalu lama. Silakan coba lagi.",
  P1017: "Koneksi ke server terputus. Silakan coba lagi.",
  P2002: "Data sudah ada (duplikat).",
  P2003: "Operasi gagal karena data ini masih terkait dengan data lain.",
  P2025: "Data tidak ditemukan atau sudah dihapus.",
  P2024: "Server sedang sibuk. Silakan coba lagi sebentar.",
};

function errorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

/** A thrown value originating from the Prisma client (known-request, init, panic,
 *  validation, or unknown). Its `.message` may leak connection/SQL details. */
function isPrismaError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("name" in error)) return false;
  const name = (error as { name?: unknown }).name;
  return typeof name === "string" && name.startsWith("PrismaClient");
}

/**
 * Normalize any thrown value into a client-safe ActionState. Services throw plain
 * `Error`s whose messages are deliberate, user-facing Indonesian text (safe to
 * surface); Prisma/infrastructure errors are mapped to generic guidance so no
 * internal detail (stack, DB URL, SQL) is ever leaked.
 */
export function fromError(error: unknown): ActionState {
  const code = errorCode(error);

  // App-level timeout guard (see `withTimeout`) — always safe to surface.
  if (code === "TIMEOUT") {
    return fail("Permintaan memakan waktu terlalu lama. Silakan coba lagi.", undefined, code);
  }

  // Prisma known-request errors carry a P-code we can phrase safely.
  if (code && code in PRISMA_MESSAGES) {
    return fail(PRISMA_MESSAGES[code], undefined, code);
  }

  // Any other Prisma error (init, panic, validation, unmapped P-code) is opaque:
  // hide its raw message behind generic, retryable guidance.
  if (isPrismaError(error)) {
    return fail(
      "Terjadi kesalahan pada server. Silakan coba lagi sebentar.",
      undefined,
      code ?? "SERVER",
    );
  }

  // A plain Error is thrown deliberately by a service as a business message.
  if (error instanceof Error && error.message) {
    return fail(error.message);
  }

  return fail("Terjadi kesalahan tak terduga. Silakan coba lagi.");
}
