// Idempotent database seed. Run with `bun run seed`.
//
// Clerk owns identity, so we cannot create a fully-formed account here. Instead we
// stage a bootstrap admin row keyed by email (with a placeholder clerkId). When the
// real person signs up in Clerk using SEED_ADMIN_EMAIL, syncClerkUser() matches by
// email, swaps in their real clerkId, and preserves the ADMIN role. No DB surgery.
import { prisma } from "@/lib/prisma";
import { upsertAdminUser } from "@/lib/services/user.service";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@portalsekolah.sch.id";
const name = process.env.SEED_ADMIN_NAME ?? "Administrator";

async function main() {
  const admin = await upsertAdminUser({ email, name });
  console.log(`[seed] Admin siap: ${admin.email} (role ${admin.role})`);
  console.log(
    "[seed] Daftar di Clerk memakai email ini untuk mengaktifkan akun admin.",
  );
}

main()
  .catch((error) => {
    console.error("[seed] Gagal:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
