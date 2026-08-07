import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/services/util";
import type { CreateAssignmentInput, UpdateAssignmentInput } from "@/lib/types";

export function createAssignment(data: CreateAssignmentInput) {
  return prisma.assignment.create({
    data: { ...data, slug: slugify(data.title) },
  });
}

export function getAssignmentsByClassSubject(classSubjectId: string) {
  return prisma.assignment.findMany({
    where: { classSubjectId },
    orderBy: { dueDate: "asc" },
  });
}

export function getAssignmentById(id: string) {
  return prisma.assignment.findUnique({
    where: { id },
    include: { submissions: true },
  });
}

export function updateAssignment(id: string, data: UpdateAssignmentInput) {
  return prisma.assignment.update({ where: { id }, data });
}

export function deleteAssignment(id: string) {
  return prisma.assignment.delete({ where: { id } });
}
