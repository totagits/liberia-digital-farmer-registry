import * as schema from "./schema";

let cachedDb: any = null;

export async function getDb(): Promise<any> {
  if (cachedDb) return cachedDb;

  // 1. Check if running in Cloudflare Workers / Miniflare environment
  try {
    const { env } = await import("cloudflare:workers");
    if (env && env.DB) {
      const { drizzle } = await import("drizzle-orm/d1");
      cachedDb = drizzle(env.DB, { schema });
      return cachedDb;
    }
  } catch {
    // Not running inside Cloudflare Workers
  }

  // 2. Universal Node.js / standalone server fallback using built-in node:sqlite
  try {
    const { DatabaseSync } = await import("node:sqlite");
    const { drizzle } = await import("drizzle-orm/sqlite-proxy");
    const fs = await import("node:fs");
    const path = await import("node:path");

    const dataDir = path.resolve(".data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, "dfr-live.db");
    const sqlite = new DatabaseSync(dbPath);

    // Run WAL mode for high concurrency
    try {
      sqlite.exec("PRAGMA journal_mode = WAL;");
    } catch {}

    // Initialize database tables if not yet created
    const checkTable = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='farmers'").get();
    if (!checkTable) {
      const drizzleDir = path.resolve("drizzle");
      if (fs.existsSync(drizzleDir)) {
        const files = fs.readdirSync(drizzleDir).filter((f: string) => f.endsWith(".sql")).sort();
        for (const f of files) {
          try {
            const migrationSql = fs.readFileSync(path.join(drizzleDir, f), "utf8");
            sqlite.exec(migrationSql);
          } catch {}
        }
      }
    }

    cachedDb = drizzle(
      async (sql: string, params: any[], method: string) => {
        try {
          if (method === "all") {
            const rows = sqlite.prepare(sql).all(...params);
            return { rows };
          } else if (method === "get") {
            const row = sqlite.prepare(sql).get(...params);
            return { rows: row ? [row] : [] };
          } else {
            sqlite.prepare(sql).run(...params);
            return { rows: [] };
          }
        } catch (e: any) {
          console.error("SQLite query error:", e.message, "SQL:", sql);
          throw e;
        }
      },
      { schema }
    );

    return cachedDb;
  } catch (err: any) {
    throw new Error(`Database connection failed: ${err.message}`);
  }
}
