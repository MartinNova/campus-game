import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Static security checks on the repository itself:
 * every table is protected by Row Level Security, database functions can't be hijacked,
 * and no secret key is committed.
 */

const MIGRATIONS = join(process.cwd(), "supabase/migrations");
const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(MIGRATIONS, f), "utf8"))
  .join("\n")
  // Comments don't count.
  .replace(/--.*$/gm, "");

const tables = [...sql.matchAll(/create table (?:if not exists )?public\.(\w+)/gi)].map(
  (m) => m[1],
);

describe("database rules (supabase/migrations)", () => {
  it("finds the app's tables", () => {
    expect(tables).toEqual(
      expect.arrayContaining(["profiles", "padel_matches", "room_listings", "messages"]),
    );
  });

  it.each(tables)("table %s has Row Level Security enabled", (table) => {
    expect(sql).toMatch(new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  });

  it("never grants table access to signed-out visitors (anon)", () => {
    expect(sql).not.toMatch(/grant [^;]*\bon (?:table )?public\.\w+[^;]* to [^;]*\banon\b/i);
  });

  it("every security definer function pins its search_path", () => {
    const definers = sql.match(/create (?:or replace )?function[\s\S]*?\$\$;/gi) ?? [];
    for (const fn of definers.filter((f) => /security definer/i.test(f)))
      expect(fn).toMatch(/set search_path = ''/i);
  });

  it("users can only write rows as themselves", () => {
    // Every insert policy checks the signed-in user.
    const inserts = sql.match(/for insert to authenticated[\s\S]*?;/gi) ?? [];
    expect(inserts.length).toBeGreaterThan(0);
    for (const policy of inserts) expect(policy).toMatch(/auth\.uid\(\)/);
  });
});

describe("secrets", () => {
  // Only files tracked by git: .env.local and node_modules are ignored on purpose.
  const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter((f) => f && !f.endsWith(".png") && !f.endsWith(".jpg") && f !== "package-lock.json");

  it("no Supabase secret or service_role key is committed", () => {
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      // Secret keys start with sb_secret_; old service_role keys are JWTs with that role.
      expect(text, file).not.toMatch(/sb_secret_[A-Za-z0-9_-]{10,}/);
      expect(text, file).not.toMatch(/eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/);
    }
  });

  it(".env.local is ignored by git", () => {
    expect(files).not.toContain(".env.local");
    expect(readFileSync(".gitignore", "utf8")).toMatch(/\.env/);
  });
});
