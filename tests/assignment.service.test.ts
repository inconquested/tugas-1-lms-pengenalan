import { describe, test, expect, afterAll } from "bun:test";
import {
  createAssignment,
  getAssignmentsByClassSubject,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} from "@/lib/services/assignment.service";
import { makeHarness, prisma } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("assignment.service", () => {
  test("createAssignment slugifies the title and stores externalReferences", async () => {
    const { cs } = await h.context();
    const a = await createAssignment({
      classSubjectId: cs.id,
      title: "Tugas Aljabar Linear!",
      description: "Kerjakan bab 3",
      externalReferences: ["https://example.com/ref"],
    });

    expect(a.slug).toBeTruthy();
    expect(a.slug).toStartWith("tugas-aljabar-linear"); // punctuation/spaces collapsed to hyphens
    expect(a.slug).toBe(a.slug.toLowerCase());
    expect(a.externalReferences).toEqual(["https://example.com/ref"]);
  });

  test("edge: duplicate titles in one class-subject get distinct slugs (random suffix)", async () => {
    const { cs } = await h.context();
    const a = await createAssignment({ classSubjectId: cs.id, title: "Kuis", externalReferences: [] });
    const b = await createAssignment({ classSubjectId: cs.id, title: "Kuis", externalReferences: [] });

    // Same base title, but the slug suffix keeps them from colliding on @@unique([classSubjectId, slug]).
    expect(a.slug).not.toBe(b.slug);
    expect(a.slug).toStartWith("kuis-");
    expect(b.slug).toStartWith("kuis-");
  });

  test("edge: empty-ish title still yields a usable slug", async () => {
    const { cs } = await h.context();
    // Title is all punctuation -> base collapses to "" -> slugify falls back to "tugas".
    const a = await createAssignment({ classSubjectId: cs.id, title: "!!!", externalReferences: [] });
    expect(a.slug).toStartWith("tugas-");
  });

  test("getAssignmentsByClassSubject sorts by dueDate asc", async () => {
    const { cs } = await h.context();
    const late = await createAssignment({
      classSubjectId: cs.id,
      title: "Late",
      dueDate: new Date("2030-12-31T00:00:00Z"),
      externalReferences: [],
    });
    const early = await createAssignment({
      classSubjectId: cs.id,
      title: "Early",
      dueDate: new Date("2030-01-01T00:00:00Z"),
      externalReferences: [],
    });

    const list = await getAssignmentsByClassSubject(cs.id);
    const idx = (id: string) => list.findIndex((a) => a.id === id);
    expect(idx(early.id)).toBeLessThan(idx(late.id));
  });

  test("getAssignmentById includes submissions; null for a missing id", async () => {
    const { cs } = await h.context();
    const a = await createAssignment({ classSubjectId: cs.id, title: "WithSubs", externalReferences: [] });
    const full = await getAssignmentById(a.id);
    expect(full?.submissions).toEqual([]); // include present, none yet
    expect(await getAssignmentById("00000000-0000-7000-8000-000000000000")).toBeNull();
  });

  test("updateAssignment patches fields; dueDate can be cleared to null", async () => {
    const { cs } = await h.context();
    const a = await createAssignment({
      classSubjectId: cs.id,
      title: "Editable",
      dueDate: new Date("2030-06-01T00:00:00Z"),
      externalReferences: [],
    });
    // UpdateAssignmentSchema types dueDate as Date|undefined, so it can't express "clear to
    // null" — but the column is nullable and Prisma clears it at runtime. Cast through unknown
    // to exercise that real behaviour (documents a gap: the schema should be .nullable()).
    const updated = await updateAssignment(a.id, { description: "revisi", dueDate: null } as unknown as Parameters<
      typeof updateAssignment
    >[1]);
    expect(updated.description).toBe("revisi");
    expect(updated.dueDate).toBeNull();
  });

  test("edge: update / delete of a missing id rejects (P2025)", async () => {
    const missing = "00000000-0000-7000-8000-000000000000";
    const codes: (string | undefined)[] = [];
    for (const op of [
      () => updateAssignment(missing, { title: "x" }),
      () => deleteAssignment(missing),
    ]) {
      try {
        await op();
      } catch (e) {
        codes.push((e as { code?: string }).code);
      }
    }
    expect(codes).toEqual(["P2025", "P2025"]);
  });

  test("edge: deleting a class-subject cascades to its assignments", async () => {
    const { cs } = await h.context();
    const a = await createAssignment({ classSubjectId: cs.id, title: "Cascade", externalReferences: [] });
    await prisma.classSubject.delete({ where: { id: cs.id } });
    expect(await getAssignmentById(a.id)).toBeNull();
  });
});
