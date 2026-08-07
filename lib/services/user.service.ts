import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";
import type { CreateUserInput, UpdateUserInput } from "@/lib/types";

export function upsertUserFromClerk(data: CreateUserInput) {
  return prisma.user.upsert({
    where: { clerkId: data.clerkId },
    create: data,
    update: { email: data.email, name: data.name, role: data.role },
  });
}

export function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export function getUsersByRole(role: Role) {
  return prisma.user.findMany({ where: { role }, orderBy: { name: "asc" } });
}

export function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({ where: { id }, data });
}

// Sync a Clerk identity into the local table. Reconciles by clerkId first, then by
// email (so an admin-provisioned row with a placeholder clerkId adopts the real one),
// and only otherwise creates a fresh, not-yet-onboarded student. Never overwrites
// role / onboarded / teacherRequestStatus on an existing row.
export async function syncClerkUser(input: {
  clerkId: string;
  email: string;
  name: string;
}) {
  const byClerk = await prisma.user.findUnique({
    where: { clerkId: input.clerkId },
  });
  if (byClerk) {
    return prisma.user.update({
      where: { clerkId: input.clerkId },
      data: { email: input.email, name: input.name },
    });
  }

  const byEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId: input.clerkId, name: input.name },
    });
  }

  return prisma.user.create({
    data: { clerkId: input.clerkId, email: input.email, name: input.name, role: "SISWA" },
  });
}

export function deleteUserByClerkId(clerkId: string) {
  return prisma.user.deleteMany({ where: { clerkId } });
}

// --- Onboarding & teacher review ---

export function completeStudentOnboarding(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { onboarded: true, role: "SISWA", teacherRequestStatus: "NONE" },
  });
}

export function requestTeacherRole(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { onboarded: true, teacherRequestStatus: "PENDING" },
  });
}

export function getPendingTeacherRequests() {
  return prisma.user.findMany({
    where: { teacherRequestStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
}

export function approveTeacherRequest(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role: "GURU", teacherRequestStatus: "APPROVED" },
  });
}

export function rejectTeacherRequest(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role: "SISWA", teacherRequestStatus: "REJECTED" },
  });
}

// Bootstrap admin. Keyed by email since Clerk owns identity: this row waits with a
// placeholder clerkId until the real person signs up with the same email, at which point
// syncClerkUser reconciles by email and adopts their clerkId while keeping the ADMIN role.
export function upsertAdminUser(input: { email: string; name: string }) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: { role: "ADMIN", onboarded: true, teacherRequestStatus: "NONE" },
    create: {
      clerkId: `seed:${input.email}`,
      email: input.email,
      name: input.name,
      role: "ADMIN",
      onboarded: true,
      teacherRequestStatus: "NONE",
    },
  });
}

// Admin-provisioned users skip onboarding: the admin already assigned their role.
export function createUserByAdmin(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      ...data,
      onboarded: true,
      teacherRequestStatus: data.role === "GURU" ? "APPROVED" : "NONE",
    },
  });
}
