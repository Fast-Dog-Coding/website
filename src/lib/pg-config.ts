import type { PoolConfig } from "pg";

/**
 * pg 8.21.0 reads channel binding only from this constructor option
 * (`Client.enableChannelBinding` in pg/lib/client.js). @types/pg 8.20.0 does
 * not declare it. The URL param `channel_binding` is not consulted.
 */
export interface PgPoolConfig extends PoolConfig {
  enableChannelBinding?: boolean;
}

/**
 * Build a node-postgres pool config from a connection string.
 *
 * Neon-managed URLs end in `channel_binding=require&sslmode=require` and
 * cannot be edited (the Vercel integration owns them). pg 8 treats sslmode
 * `prefer`, `require`, and `verify-ca` as `verify-full` but warns that pg 9
 * will switch those aliases to weaker libpq semantics. Rewrite only those
 * three values. `disable`, `allow`, `verify-full`, and a missing sslmode are
 * left alone — sslmode is never added, so `postgresql://localhost:5432/fdc_website`
 * is unchanged.
 *
 * `channel_binding=require` is copied onto the parsed config by
 * pg-connection-string 2.13.0 and then ignored, so `enableChannelBinding`
 * stays false unless we set it. The leftover query param does not warn, so
 * it stays in the URL (stripping it would not change pg's behavior).
 *
 * Empty, unset, and unparseable strings are returned as a connectionString
 * config and are not thrown on. Callers that require a URL still check it.
 */
export function pgPoolConfig(
  connectionString: string | undefined | null,
): PgPoolConfig {
  if (!connectionString) {
    return { connectionString: connectionString ?? undefined };
  }

  const rewritten = connectionString.replace(
    /([?&]sslmode=)(require|prefer|verify-ca)(?=&|#|$)/gi,
    "$1verify-full",
  );

  const config: PgPoolConfig = { connectionString: rewritten };
  if (/(?:[?&]channel_binding=)require(?=&|#|$)/i.test(connectionString)) {
    config.enableChannelBinding = true;
  }
  return config;
}

/**
 * Connection string for `prisma db push`.
 *
 * Quaint (Prisma schema engine shipped with engines 7.8.0) only understands
 * sslmode `disable`, `prefer`, and `require`. `verify-full` is silently
 * treated as `prefer`, and invalid certificates are accepted unless
 * `sslaccept=strict`. Append that param when the URL has `sslmode=require`
 * and no `sslaccept`. Leave `sslmode=require` in place. URLs without sslmode
 * are unchanged. Seed still uses {@link pgPoolConfig}, which rewrites
 * sslmode to `verify-full` for node-postgres.
 */
export function prismaDbPushUrl(
  connectionString: string | undefined | null,
): string {
  if (!connectionString) return connectionString ?? "";
  if (!/(?:[?&]sslmode=)require(?=&|#|$)/i.test(connectionString)) {
    return connectionString;
  }
  if (/(?:[?&]sslaccept=)/i.test(connectionString)) {
    return connectionString;
  }

  const hashIndex = connectionString.indexOf("#");
  const base =
    hashIndex === -1 ? connectionString : connectionString.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : connectionString.slice(hashIndex);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}sslaccept=strict${hash}`;
}
