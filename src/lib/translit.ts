// Українсько-латинська транслітерація за офіційною таблицею КМУ (постанова №55, 2010)
// та генерація slug-ів для URL.

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie",
  ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "",
  ю: "iu", я: "ia",
};

// Диграфи на початку слова: зг → zgh (щоб відрізнити від ж → zh).
const START_DIGRAPHS: Record<string, string> = { зг: "zgh" };

function translitWord(word: string): string {
  let out = "";
  const lower = word.toLowerCase();

  // Спецвипадок «й/є/ї/ю/я» на початку слова.
  const startExceptions: Record<string, string> = {
    є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya",
  };

  for (let i = 0; i < lower.length; i++) {
    const two = lower.slice(i, i + 2);
    if (i === 0 && START_DIGRAPHS[two]) {
      out += START_DIGRAPHS[two];
      i++;
      continue;
    }
    const ch = lower[i];
    if (i === 0 && startExceptions[ch]) {
      out += startExceptions[ch];
      continue;
    }
    out += MAP[ch] ?? ch;
  }
  return out;
}

/** Транслітерує український текст у латиницю. */
export function transliterate(text: string): string {
  return text.split(/(\s+)/).map(translitWord).join("");
}

/** Робить URL-slug з довільного тексту (укр/лат). */
export function slugify(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/['ʼ`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
