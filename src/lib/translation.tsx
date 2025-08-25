import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleTranslateClientOptions, GoogleTranslateContext, GoogleTranslateProviderProps } from "../types/interface";
import { getFromDB, getTranslationFromGoogle, saveToDB, wordToKey } from "../utils/helpers";

export const GoogleTranslateProvider: React.FC<GoogleTranslateProviderProps> = ({
  children,
  language_target,
  google_api_key
}) => {
  const [cache, setCache] = useState<Record<string, string>>({});
  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    setCache({});
  }, [language_target]);

  const googleTranslate = useCallback(
    (word: string, disable_fetch?: boolean): string => {
      if (!word || !language_target || !google_api_key || language_target === "en") return word;

      const key = wordToKey(word, language_target);
      if (cache[key]) return cache[key];

      if (!inFlight.current.has(key)) {
        inFlight.current.add(key);

        (async () => {
          const entry = await getFromDB(key);
          if (entry?.translation) {
            setCache((prev) => ({ ...prev, [key]: entry.translation }));
            inFlight.current.delete(key);
            return;
          }
          
          if (!disable_fetch) {
            try {
              const translation_result = await getTranslationFromGoogle({ words: [word], language_target, google_api_key });
              const translated = translation_result?.[0]?.translatedText ?? word;

              await saveToDB(key, {
                word,
                target: language_target,
                translation: translated,
              });
              setCache((prev) => ({ ...prev, [key]: translated }));
            } catch (e) {
              console.error("Translation failed:", e);
            } finally {
              inFlight.current.delete(key);
            }
          }
        })();
      }

      return word;
    },
    [cache, language_target, google_api_key]
  );

  return (
    <GoogleTranslateContext.Provider value={{ googleTranslate, gt: googleTranslate }}>
      {children}
    </GoogleTranslateContext.Provider>
  );
};

export class GoogleTranslateClient {
  private google_api_key: string;
  private language_target: string;

  constructor({ google_api_key, language_target }: GoogleTranslateClientOptions) {
    this.google_api_key = google_api_key;
    this.language_target = language_target;
  }

  /**
   * Translate multiple words in bulk. Returns a Promise of translations.
   * @example const translations = await client.bulkGoogleTranslate(["hello", "world"])
   */
  async bulkGoogleTranslate(words: string[]): Promise<string[]> {
    const { google_api_key, language_target } = this;

    if (!words.length || !language_target || !google_api_key || language_target === "en") return words;

    const results: string[] = [];
    const missing: string[] = [];

    for (const word of words) {
      const key = wordToKey(word, language_target);

      const entry = await getFromDB(key);
      if (entry?.translation) {
        results.push(entry.translation);
      } else {
        results.push(word);
        missing.push(word);
      }
    }

    if (missing.length > 0) {
      try {
        const translation_result = await getTranslationFromGoogle({ words: missing, language_target, google_api_key });
        const translations = translation_result?.map((t: any) => t.translatedText) ?? [];

        for (let i = 0; i < missing.length; i++) {
          const word = missing[i];
          const translated = translations[i] ?? word;
          const key = wordToKey(word, language_target);

          await saveToDB(key, {
            word,
            target: language_target,
            translation: translated,
          });

          const idx = words.indexOf(word);
          if (idx !== -1) results[idx] = translated;
        }
      } catch (e) {
        console.error("Bulk translation failed:", e);
      }
    }

    return results;
  }
};
