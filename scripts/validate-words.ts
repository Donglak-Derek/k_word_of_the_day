#!/usr/bin/env ts-node

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WordZ } from "@/lib/wordSchema";

const DIR = join(process.cwd(), "data", "words");

function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const ids = new Set<string>(),
    slugs = new Set<string>();
  let total = 0;

  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    if (!Array.isArray(raw)) throw new Error(`${f}: root is not an array`);
    raw.forEach((w: unknown, i: number) => {
      const parsed = WordZ.parse(w);
      if (ids.has(parsed.id))
        throw new Error(`Duplicate id ${parsed.id} in ${f}[${i}]`);
      if (slugs.has(parsed.slug))
        throw new Error(`Duplicate slug ${parsed.slug} in ${f}[${i}]`);
      ids.add(parsed.id);
      slugs.add(parsed.slug);
      total++;
    });
    console.log(`✓ ${f} (${raw.length})`);
  }
  console.log(`All good ✅ Total: ${total}`);
}
main();
