import { WordZ, type Word } from "@/lib/wordSchema";

// static imports (add more categories when you create files)
import cultureRaw from "@/data/words/culture.json";
import slangRaw from "@/data/words/slang.json";

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
  const all = [...culture, ...slang];

  // duplicate id guard (nice safety)
  const seen = new Set<string>();
  for (const w of all) {
    if (seen.has(w.id)) throw new Error(`Duplicate id: ${w.id}`);
    seen.add(w.id);
  }
  return all;
}

export function getByCategory(cat: string): Word[] {
  const c = cat.toLowerCase();
  return getAllWordsValidated().filter((w) => w.category.toLowerCase() === c);
}
