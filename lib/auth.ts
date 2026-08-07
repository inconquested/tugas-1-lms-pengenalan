import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { syncClerkUser } from "@/lib/services/user.service";
import type { Role, User } from "@/app/generated/prisma/client";

// ────────────────────────────────────────────────────────────────────────────
// AUTH SEAM
//
// Every page, layout and Server Action reads the session ONLY through the helpers
// below. Identity comes from Clerk; the local `User` row is the app's source of
// truth for role / onboarding. `resolveCurrentUser` lazily syncs the Clerk profile
// into Postgres, so a user is never missing from the DB even if the webhook has not
// run yet (see app/api/webhooks/clerk/route.ts for the async sync).
//
// Clerk is imported dynamically so this module's pure exports (canAccess,
// dashboardPath) stay importable in the plain bun:test runtime.
// ────────────────────────────────────────────────────────────────────────────

async function resolveCurrentUser(): Promise<User | null> {
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  // Webhook lag or not yet configured: sync from the Clerk profile on the fly.
  const cu = await currentUser();
  if (!cu) return null;
  const email =
    cu.primaryEmailAddress?.emailAddress ??
    cu.emailAddresses[0]?.emailAddress ??
    `${userId}@clerk.local`;
  const name = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || email;
  return syncClerkUser({ clerkId: userId, email, name });
}

/** The signed-in user (synced to the DB), or `null` when signed out. Never throws. */
export function getCurrentUser(): Promise<User | null> {
  return resolveCurrentUser();
}

/**
 * The signed-in, onboarded user. Redirects to sign-in when signed out, to the
 * onboarding chooser when the role has not been picked, and to the waiting screen
 * while a teacher request is pending.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboarded) redirect("/onboarding");
  if (user.teacherRequestStatus === "PENDING") redirect("/onboarding/pending");
  return user;
}

/** Pure route-guard policy: may a user of `role` enter an area allowing `allowed`. */
export function canAccess(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}

/** The signed-in user, asserted to hold one of `roles`; redirects otherwise. */
export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!canAccess(user.role, roles)) redirect(dashboardPath(user.role));
  return user;
}

/** Landing route for a role after sign-in. */
export function dashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "GURU":
      return "/guru";
    case "SISWA":
      return "/siswa";
  }
}
