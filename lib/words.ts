import { WordZ, type Word } from "@/lib/wordSchema";

// static imports (add more categories when you create files)
import cultureRaw from "@/data/words/culture.json";
import slangRaw from "@/data/words/slang.json";
import everydayRaw from "@/data/words/everyday.json";
import workRaw from "@/data/words/work.json";

type Labeled = { w: Word; src: string };

function validateArrayLabeled(raw: unknown[], label: string): Labeled[] {
  try {
    return (raw as unknown[]).map((x, i) => {
      const w = WordZ.parse(x);
      // we can't get the real line, but index helps you find it
      return { w, src: `${label}.json[${i}]` };
    });
  } catch (e) {
    throw new Error(
      `Validation failed for ${label}.json: ${(e as Error).message}`
    );
  }
}

export function getAllWordsValidated(): Word[] {
  const chunks: Labeled[][] = [
    validateArrayLabeled(cultureRaw as unknown[], "culture"),
    validateArrayLabeled(slangRaw as unknown[], "slang"),
    validateArrayLabeled(everydayRaw as unknown[], "everyday"),
    validateArrayLabeled(workRaw as unknown[], "work"),
  ];

  const allLabeled: Labeled[] = chunks.flat();

  // duplicate guard with file reporting
  const idToSrc = new Map<string, string>();
  const slugToSrc = new Map<string, string>();

  for (const { w, src } of allLabeled) {
    const prevIdSrc = idToSrc.get(w.id);
    if (prevIdSrc) {
      throw new Error(
        `Duplicate id "${w.id}" found in ${src} and ${prevIdSrc}`
      );
    }
    idToSrc.set(w.id, src);

    const prevSlugSrc = slugToSrc.get(w.slug);
    if (prevSlugSrc) {
      throw new Error(
        `Duplicate slug "${w.slug}" found in ${src} and ${prevSlugSrc}`
      );
    }
    slugToSrc.set(w.slug, src);
  }

  return allLabeled.map(({ w }) => w);
}

export function getByCategory(cat: string): Word[] {
  const c = cat.toLowerCase();
  return getAllWordsValidated().filter((w) => w.category.toLowerCase() === c);
}
