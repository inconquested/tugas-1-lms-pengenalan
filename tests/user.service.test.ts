import { describe, test, expect, afterAll } from "bun:test";
import {
  upsertUserFromClerk,
  getUserById,
  getUserByClerkId,
  getUsersByRole,
  updateUser,
} from "@/lib/services/user.service";
import { makeHarness } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("user.service", () => {
  test("upsertUserFromClerk inserts a brand-new user (create path)", async () => {
    const clerkId = `clerk-${h.uid()}`;
    const email = `${h.uid()}@e2e.test`;
    const u = h.trackUser(
      await upsertUserFromClerk({ clerkId, email, name: "Budi", role: "SISWA" }),
    );

    expect(u.id).toBeString();
    expect(u.clerkId).toBe(clerkId);
    expect(u.email).toBe(email);
    expect(u.role).toBe("SISWA");
    expect(u.createdAt).toBeInstanceOf(Date);
  });

  test("upsertUserFromClerk updates name/email/role on repeat clerkId (update path)", async () => {
    const clerkId = `clerk-${h.uid()}`;
    const first = h.trackUser(
      await upsertUserFromClerk({
        clerkId,
        email: `${h.uid()}@e2e.test`,
        name: "Original",
        role: "SISWA",
      }),
    );

    const newEmail = `${h.uid()}@e2e.test`;
    const second = await upsertUserFromClerk({
      clerkId,
      email: newEmail,
      name: "Renamed",
      role: "GURU",
    });

    // Same row, mutated in place — not a second insert.
    expect(second.id).toBe(first.id);
    expect(second.name).toBe("Renamed");
    expect(second.email).toBe(newEmail);
    expect(second.role).toBe("GURU");
    // createdAt must be preserved across the upsert.
    expect(second.createdAt.getTime()).toBe(first.createdAt.getTime());
  });

  test("upsert defaults role to SISWA when omitted (Prisma schema default)", async () => {
    const u = h.trackUser(
      // deliberately omit role to lean on the DB default
      await upsertUserFromClerk({
        clerkId: `clerk-${h.uid()}`,
        email: `${h.uid()}@e2e.test`,
        name: "No Role",
      } as Parameters<typeof upsertUserFromClerk>[0]),
    );
    expect(u.role).toBe("SISWA");
  });

  test("edge: duplicate email with a different clerkId violates the unique constraint", async () => {
    const email = `${h.uid()}@e2e.test`;
    h.trackUser(
      await upsertUserFromClerk({ clerkId: `clerk-${h.uid()}`, email, name: "First", role: "SISWA" }),
    );

    let code: string | undefined;
    try {
      await upsertUserFromClerk({ clerkId: `clerk-${h.uid()}`, email, name: "Second", role: "SISWA" });
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2002"); // unique constraint failed
  });

  test("getUserById / getUserByClerkId round-trip, and return null when absent", async () => {
    const u = await h.user();
    expect((await getUserById(u.id))?.id).toBe(u.id);
    expect((await getUserByClerkId(u.clerkId))?.id).toBe(u.id);

    // A well-formed but non-existent uuid resolves to null, not a throw.
    expect(await getUserById("00000000-0000-7000-8000-000000000000")).toBeNull();
    expect(await getUserByClerkId(`missing-${h.uid()}`)).toBeNull();
  });

  test("getUsersByRole returns only the role, sorted by name asc", async () => {
    // Names chosen so lexical asc != insertion order.
    const zeta = await h.teacher({ name: `Zeta ${h.uid()}` });
    const alpha = await h.teacher({ name: `Alpha ${h.uid()}` });
    const mike = await h.teacher({ name: `Mike ${h.uid()}` });
    const decoy = await h.student({ name: `Alpha-decoy ${h.uid()}` });

    const gurus = await getUsersByRole("GURU");
    expect(gurus.every((u) => u.role === "GURU")).toBeTrue();
    expect(gurus.some((u) => u.id === decoy.id)).toBeFalse();

    // Filter to just this test's rows, then assert their relative order is asc-by-name.
    const mine = gurus.filter((u) => [zeta.id, alpha.id, mike.id].includes(u.id));
    expect(mine.map((u) => u.id)).toEqual([alpha.id, mike.id, zeta.id]);
  });

  test("updateUser mutates provided fields and leaves the rest untouched", async () => {
    const u = await h.student({ name: "Before" });
    const updated = await updateUser(u.id, { name: "After", role: "ADMIN" });
    expect(updated.name).toBe("After");
    expect(updated.role).toBe("ADMIN");
    expect(updated.email).toBe(u.email); // untouched
  });

  test("edge: updateUser on a missing id rejects (P2025)", async () => {
    let code: string | undefined;
    try {
      await updateUser("00000000-0000-7000-8000-000000000000", { name: "ghost" });
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2025"); // record to update not found
  });
});
