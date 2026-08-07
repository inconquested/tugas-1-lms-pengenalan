import "server-only";
import { withTimeout } from "@/lib/services/util";

// ────────────────────────────────────────────────────────────────────────────
// CLERK AVATAR RESOLUTION (no schema change)
//
// The local `User` row stores no image — identity images live in Clerk. To render
// *other* people's avatars (a user directory, a class roster) we batch-resolve
// their Clerk profile images by `clerkId` on the server. The current signed-in
// user is handled client-side via `useUser().imageUrl` instead.
//
// Never throws: a missing key, a rate limit, or any Clerk error yields an empty
// map, so avatars degrade cleanly to programmatic initials (`AvatarFallback`).
// ────────────────────────────────────────────────────────────────────────────

/** Map of `clerkId → imageUrl` for the users who have uploaded a real photo. */
export async function getClerkAvatarMap(
  clerkIds: readonly (string | null | undefined)[],
): Promise<Map<string, string>> {
  const ids = [...new Set(clerkIds.filter((v): v is string => Boolean(v)))];
  const map = new Map<string, string>();
  if (ids.length === 0) return map;

  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    // getUserList caps a `userId` filter at 500; chunk defensively.
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      // Cap the external Clerk request: a hung network call would otherwise stall
      // the whole page render. On timeout we throw → caught below → initials.
      const { data } = await withTimeout(
        client.users.getUserList({ userId: chunk, limit: chunk.length }),
        8_000,
      );
      for (const u of data) {
        // `hasImage` is false for Clerk's generated default — prefer our own
        // initials in that case, so only real uploads land in the map.
        if (u.hasImage && u.imageUrl) map.set(u.id, u.imageUrl);
      }
    }
  } catch {
    // Degrade to initials.
  }
  return map;
}
