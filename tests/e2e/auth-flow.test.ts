// Auth state -> redirection + role-based route-guard enforcement.
//
// The HTTP redirect itself lives in requireRole()/requireUser(), which read the
// session cookie via next/headers and can only run inside a request. Here we test
// the two pure pieces those functions delegate to -- the landing route per role
// (dashboardPath) and the access policy (canAccess) -- against real DB users, so
// the guard's decision table is covered without a running server.
import { describe, test, expect, afterAll } from "bun:test";
import { canAccess, dashboardPath } from "@/lib/auth";
import type { Role } from "@/app/generated/prisma/client";
import { makeHarness } from "../helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("auth-flow — landing route per role", () => {
  test("each real user is sent to their own dashboard after sign-in", async () => {
    const admin = await h.admin();
    const guru = await h.teacher();
    const siswa = await h.student();

    expect(dashboardPath(admin.role)).toBe("/admin");
    expect(dashboardPath(guru.role)).toBe("/guru");
    expect(dashboardPath(siswa.role)).toBe("/siswa");
  });
});

describe("auth-flow — role-based route guard", () => {
  const areas: { path: string; allowed: Role[] }[] = [
    { path: "/admin", allowed: ["ADMIN"] },
    { path: "/guru", allowed: ["GURU"] },
    { path: "/siswa", allowed: ["SISWA"] },
  ];

  test("a role may enter only the area that allows it", () => {
    for (const role of ["ADMIN", "GURU", "SISWA"] as Role[]) {
      for (const area of areas) {
        const expected = area.allowed.includes(role);
        expect(canAccess(role, area.allowed)).toBe(expected);
      }
    }
  });

  test("a blocked user is redirected to their own dashboard, not the requested area", () => {
    // Mirrors requireRole: when canAccess is false, redirect(dashboardPath(user.role)).
    const siswaWantsAdmin = canAccess("SISWA", ["ADMIN"]);
    expect(siswaWantsAdmin).toBe(false);
    expect(dashboardPath("SISWA")).toBe("/siswa");

    const guruWantsAdmin = canAccess("GURU", ["ADMIN"]);
    expect(guruWantsAdmin).toBe(false);
    expect(dashboardPath("GURU")).toBe("/guru");
  });

  test("an area may allow multiple roles", () => {
    expect(canAccess("GURU", ["ADMIN", "GURU"])).toBe(true);
    expect(canAccess("SISWA", ["ADMIN", "GURU"])).toBe(false);
  });
});
