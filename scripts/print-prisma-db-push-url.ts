/**
 * Print the connection string `prisma db push` should use.
 * Quaint cannot honor sslmode=verify-full; see prismaDbPushUrl.
 */
import { prismaDbPushUrl } from "../src/lib/pg-config";

process.stdout.write(prismaDbPushUrl(process.env.DATABASE_URL ?? ""));
