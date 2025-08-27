import { WordZ, type Word } from "@/lib/wordSchema";

// static imports (add more categories when you create files)
import cultureRaw from "@/data/words/culture.json";
import slangRaw from "@/data/words/slang.json";
import everydayRaw from "@/data/words/everyday.json";
import workRaw from "@/data/words/work.json";

function validateArray(raw: unknown[], label: string): Word[] {
  try {
    return (raw as unknown[]).map((w) => WordZ.parse(w));
  } catch (e) {
    throw new Error(
      `Validation failed for ${label}.json: ${(e as Error).message}`
    );
  }
}

export function getAllWordsValidated(): Word[] {
  const culture = validateArray(cultureRaw as unknown[], "culture");
  const slang = validateArray(slangRaw as unknown[], "slang");
  const everyday = validateArray(everydayRaw as unknown[], "everyday");
  const work = validateArray(workRaw as unknown[], "work");

  const all = [...culture, ...slang, ...everyday, ...work];

  // duplicate id guard (nice safety)
  const ids = new Set<string>(),
    slugs = new Set<string>();
  for (const w of all) {
    if (ids.has(w.id)) throw new Error(`Duplicate id: ${w.id}`);
    if (slugs.has(w.slug)) throw new Error(`Duplicate slug: ${w.slug}`);
    ids.add(w.id);
    slugs.add(w.slug);
  }
  return all;
}

export function getByCategory(cat: string): Word[] {
  const c = cat.toLowerCase();
  return getAllWordsValidated().filter((w) => w.category.toLowerCase() === c);
}
