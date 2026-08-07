import type { z } from "zod";
import type {
  AcademicYear,
  Assignment,
  Class,
  ClassStudent,
  ClassSubject,
  Subject,
  Submission,
  User,
} from "@/app/generated/prisma/client";

import type {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/lib/validations/user.schema";
import type {
  CreateAcademicYearSchema,
  UpdateAcademicYearSchema,
} from "@/lib/validations/academic-year.schema";
import type {
  CreateSubjectSchema,
  UpdateSubjectSchema,
} from "@/lib/validations/subject.schema";
import type {
  CreateClassSchema,
  UpdateClassSchema,
  JoinClassByCodeSchema,
  JoinHomeroomByCodeSchema,
} from "@/lib/validations/class.schema";
import type {
  CreateClassSubjectSchema,
  UpdateClassSubjectSchema,
  JoinSubjectByCodeSchema,
} from "@/lib/validations/class-subject.schema";
import type {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
} from "@/lib/validations/assignment.schema";
import type {
  CreateSubmissionSchema,
  GradeSubmissionSchema,
} from "@/lib/validations/submission.schema";
import type {
  UpsertRaporComponentSchema,
  UpdateRaporFinalSchema,
  LockRaporSchema,
} from "@/lib/validations/rapor.schema";

// --- DTOs / inputs inferred from Zod schemas ---
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export type CreateAcademicYearInput = z.infer<typeof CreateAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof UpdateAcademicYearSchema>;

export type CreateSubjectInput = z.infer<typeof CreateSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectSchema>;

export type CreateClassInput = z.infer<typeof CreateClassSchema>;
export type UpdateClassInput = z.infer<typeof UpdateClassSchema>;
export type JoinClassByCodeInput = z.infer<typeof JoinClassByCodeSchema>;
export type JoinHomeroomByCodeInput = z.infer<typeof JoinHomeroomByCodeSchema>;

export type CreateClassSubjectInput = z.infer<typeof CreateClassSubjectSchema>;
export type UpdateClassSubjectInput = z.infer<typeof UpdateClassSubjectSchema>;
export type JoinSubjectByCodeInput = z.infer<typeof JoinSubjectByCodeSchema>;

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;

export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;
export type GradeSubmissionInput = z.infer<typeof GradeSubmissionSchema>;

export type UpsertRaporComponentInput = z.infer<typeof UpsertRaporComponentSchema>;
export type UpdateRaporFinalInput = z.infer<typeof UpdateRaporFinalSchema>;
export type LockRaporInput = z.infer<typeof LockRaporSchema>;

// --- Composite relational types (Prisma model + includes) ---
export type ClassSubjectWithSubjectAndTeacher = ClassSubject & {
  subject: Subject;
  teacher: User | null;
};

export type ClassWithRelations = Class & {
  academicYear: AcademicYear;
  homeroomTeacher: User | null;
  classSubjects: ClassSubjectWithSubjectAndTeacher[];
};

export type ClassStudentWithStudent = ClassStudent & { student: User };

export type AssignmentWithSubmissions = Assignment & {
  submissions: Submission[];
};

export type SubmissionWithStudent = Submission & { student: User };
