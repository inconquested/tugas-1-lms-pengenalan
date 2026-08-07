import { describe, test, expect, afterAll } from "bun:test";
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "@/lib/services/subject.service";
import { makeHarness, prisma } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

describe("subject.service", () => {
  test("createSubject + getSubjectById round-trip", async () => {
    const s = h.trackSubject(
      await createSubject({ name: "Matematika", code: `MTK-${h.uid()}` }),
    );
    expect((await getSubjectById(s.id))?.name).toBe("Matematika");
    expect(await getSubjectById("00000000-0000-7000-8000-000000000000")).toBeNull();
  });

  test("getSubjects is sorted by name asc", async () => {
    const tag = h.uid();
    const zoo = h.trackSubject(await createSubject({ name: `Zoologi ${tag}`, code: `Z-${tag}` }));
    const bio = h.trackSubject(await createSubject({ name: `Biologi ${tag}`, code: `B-${tag}` }));

    const mine = (await getSubjects()).filter((s) => [zoo.id, bio.id].includes(s.id));
    expect(mine.map((s) => s.id)).toEqual([bio.id, zoo.id]); // asc
  });

  test("edge: duplicate code violates the unique constraint", async () => {
    const code = `DUP-${h.uid()}`;
    h.trackSubject(await createSubject({ name: "First", code }));

    let err: string | undefined;
    try {
      await createSubject({ name: "Second", code });
    } catch (e) {
      err = (e as { code?: string }).code;
    }
    expect(err).toBe("P2002");
  });

  test("updateSubject renames without touching the code", async () => {
    const s = h.trackSubject(await createSubject({ name: "Old", code: `U-${h.uid()}` }));
    const updated = await updateSubject(s.id, { name: "New" });
    expect(updated.name).toBe("New");
    expect(updated.code).toBe(s.code);
  });

  test("edge: update / delete of a missing id rejects (P2025)", async () => {
    const missing = "00000000-0000-7000-8000-000000000000";
    const codes: (string | undefined)[] = [];
    for (const op of [() => updateSubject(missing, { name: "x" }), () => deleteSubject(missing)]) {
      try {
        await op();
      } catch (e) {
        codes.push((e as { code?: string }).code);
      }
    }
    expect(codes).toEqual(["P2025", "P2025"]);
  });

  test("edge: deleting a subject cascades to its class-subjects", async () => {
    // Build subject -> class-subject, then delete the subject and confirm the join row is gone.
    const subj = await createSubject({ name: "Doomed", code: `DEL-${h.uid()}` });
    const cls = await h.klass();
    const cs = await h.classSubject({ classId: cls.id, subjectId: subj.id });

    expect(await prisma.classSubject.findUnique({ where: { id: cs.id } })).not.toBeNull();
    await deleteSubject(subj.id);
    expect(await prisma.classSubject.findUnique({ where: { id: cs.id } })).toBeNull();
  });
});
