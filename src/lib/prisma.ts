import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (local) or your host's environment variables (Netlify / Vercel / etc.).",
    );
  }
  // TEMP DIAGNOSTIC: log which DB host we're connecting to. Remove after redirect-loop fix.
  try {
    const u = new URL(connectionString);
    console.log("[PRISMA] connecting to", u.host, u.pathname);
  } catch {
    console.log("[PRISMA] connecting (URL parse failed)");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Lazy proxy: `prisma` can be imported without ever touching DATABASE_URL.
// The real client is created on the first property access (a query call),
// so the module is safe to load during Next.js build even if env vars are
// missing — only actual runtime queries would then fail with a clear error.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  },
});
