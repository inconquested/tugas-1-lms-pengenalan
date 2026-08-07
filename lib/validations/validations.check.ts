// Runnable check: `bunx tsx lib/validations/validations.check.ts`
// Asserts each schema accepts valid data and rejects invalid data.
import assert from "node:assert/strict";
import { CreateUserSchema } from "./user.schema";
import { CreateAcademicYearSchema } from "./academic-year.schema";
import { CreateAssignmentSchema } from "./assignment.schema";
import { GradeSubmissionSchema } from "./submission.schema";
import { UpsertRaporComponentSchema } from "./rapor.schema";
import { JoinClassByCodeSchema } from "./class.schema";

const UUID = "0195f0a0-0000-7000-8000-000000000000"; // valid v7-shaped uuid

const ok = <T>(s: { safeParse: (v: unknown) => { success: boolean; data?: T } }, v: unknown) =>
  assert.equal(s.safeParse(v).success, true, `expected valid: ${JSON.stringify(v)}`);
const bad = (s: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  assert.equal(s.safeParse(v).success, false, `expected invalid: ${JSON.stringify(v)}`);

// user
ok(CreateUserSchema, { clerkId: "c1", email: "a@b.com", name: "Budi" });
bad(CreateUserSchema, { clerkId: "c1", email: "not-email", name: "Budi" });
bad(CreateUserSchema, { clerkId: "c1", email: "a@b.com", name: "Budi", role: "SUPERADMIN" });

// academic year
ok(CreateAcademicYearSchema, { year: "2025/2026", semester: "GANJIL" });
bad(CreateAcademicYearSchema, { year: "2025", semester: "GANJIL" });
bad(CreateAcademicYearSchema, { year: "2025/2026", semester: "SPRING" });

// assignment
ok(CreateAssignmentSchema, { classSubjectId: UUID, title: "Tugas 1" });
bad(CreateAssignmentSchema, { classSubjectId: "nope", title: "Tugas 1" });
bad(CreateAssignmentSchema, { classSubjectId: UUID, title: "x", externalReferences: ["not a url"] });

// grade range 0-100
ok(GradeSubmissionSchema, { grade: 88 });
bad(GradeSubmissionSchema, { grade: 101 });
bad(GradeSubmissionSchema, { grade: -1 });

// rapor score range 0-100
ok(UpsertRaporComponentSchema, { classSubjectId: UUID, studentId: UUID, knowledgeScore: 90 });
bad(UpsertRaporComponentSchema, { classSubjectId: UUID, studentId: UUID, knowledgeScore: 200 });

// join code — normalized to trimmed uppercase so a code typed in lowercase still matches
// the uppercase-only codes stored in the DB.
ok(JoinClassByCodeSchema, { studentJoinCode: "ABC123" });
bad(JoinClassByCodeSchema, { studentJoinCode: "" });
assert.equal(
  JoinClassByCodeSchema.parse({ studentJoinCode: " abcd2345 " }).studentJoinCode,
  "ABCD2345",
);

console.log("✓ all validation checks passed");
