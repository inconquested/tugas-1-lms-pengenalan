// Preloaded before any test file (see bunfig.toml). Builds the Prisma client the whole
// suite shares and injects it as globalThis.prisma, which lib/prisma.ts picks up via its
// singleton fallback — so every service under test talks to this one client.
import { afterAll } from "bun:test";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

// Tests hit the session-mode pooler (DIRECT_URL), not the pgbouncer transaction pooler,
// so interactive Serializable transactions get a stable dedicated connection.
if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
const client = new PrismaClient({
  adapter: new PrismaPg(pool as unknown as ConstructorParameters<typeof PrismaPg>[0]),
  // The default 2s maxWait is tight against a remote pooler; give transactions room.
  transactionOptions: { maxWait: 20000, timeout: 30000 },
});
(globalThis as unknown as { prisma?: unknown }).prisma = client;

afterAll(async () => {
  await client.$disconnect();
  await pool.end().catch(() => {});
});
