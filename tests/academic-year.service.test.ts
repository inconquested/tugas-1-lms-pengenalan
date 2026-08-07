import { describe, test, expect, afterAll } from "bun:test";
import {
  createAcademicYear,
  getAcademicYears,
  getActiveAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  setActiveAcademicYear,
} from "@/lib/services/academic-year.service";
import { makeHarness } from "./helpers";

const h = makeHarness();
afterAll(h.cleanup);

// Unique 4-digit year strings for this file, disjoint from the harness's own base.
let ySeq = 4200;
const yr = () => `${ySeq++}`;

describe("academic-year.service", () => {
  test("createAcademicYear persists with isActive defaulting to false", async () => {
    const y = h.trackYear(
      await createAcademicYear({ year: `${yr()}/${yr()}`, semester: "GANJIL" }),
    );
    expect(y.id).toBeString();
    expect(y.isActive).toBeFalse();
    expect(y.semester).toBe("GANJIL");
  });

  test("getAcademicYears is sorted by year desc", async () => {
    const low = h.trackYear(await createAcademicYear({ year: "3001/3002", semester: "GANJIL" }));
    const high = h.trackYear(await createAcademicYear({ year: "3009/3010", semester: "GANJIL" }));

    const all = await getAcademicYears();
    const mine = all.filter((y) => [low.id, high.id].includes(y.id));
    expect(mine.map((y) => y.id)).toEqual([high.id, low.id]); // desc
  });

  test("edge: same (year, semester) twice violates the composite unique constraint", async () => {
    const year = `${yr()}/${yr()}`;
    h.trackYear(await createAcademicYear({ year, semester: "GENAP" }));

    let code: string | undefined;
    try {
      await createAcademicYear({ year, semester: "GENAP" });
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2002");
  });

  test("edge: same year but different semester is allowed", async () => {
    const year = `${yr()}/${yr()}`;
    const ganjil = h.trackYear(await createAcademicYear({ year, semester: "GANJIL" }));
    const genap = h.trackYear(await createAcademicYear({ year, semester: "GENAP" }));
    expect(ganjil.id).not.toBe(genap.id);
  });

  test("setActiveAcademicYear enforces exactly one active year globally", async () => {
    const a = h.trackYear(await createAcademicYear({ year: `${yr()}/${yr()}`, semester: "GANJIL" }));
    const b = h.trackYear(await createAcademicYear({ year: `${yr()}/${yr()}`, semester: "GANJIL" }));

    await setActiveAcademicYear(a.id);
    expect((await getActiveAcademicYear())?.id).toBe(a.id);

    // Switching to b must flip a off — the transaction turns *all* active rows off first.
    await setActiveAcademicYear(b.id);
    const active = await getActiveAcademicYear();
    expect(active?.id).toBe(b.id);

    // Re-read a directly: it must no longer be active.
    const refetched = (await getAcademicYears()).find((y) => y.id === a.id);
    expect(refetched?.isActive).toBeFalse();
  });

  test("updateAcademicYear patches a single field", async () => {
    const y = h.trackYear(await createAcademicYear({ year: `${yr()}/${yr()}`, semester: "GANJIL" }));
    const updated = await updateAcademicYear(y.id, { semester: "GENAP" });
    expect(updated.semester).toBe("GENAP");
    expect(updated.year).toBe(y.year); // untouched
  });

  test("deleteAcademicYear removes the row; a second delete rejects (P2025)", async () => {
    const y = await createAcademicYear({ year: `${yr()}/${yr()}`, semester: "GANJIL" });
    await deleteAcademicYear(y.id);
    expect((await getAcademicYears()).some((x) => x.id === y.id)).toBeFalse();

    let code: string | undefined;
    try {
      await deleteAcademicYear(y.id);
    } catch (e) {
      code = (e as { code?: string }).code;
    }
    expect(code).toBe("P2025");
  });
});
