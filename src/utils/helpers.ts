import { apiBaseURL } from "../constants";
import { Translation } from "../types/interface";
import axios from "axios";

const DB_NAME = "GoogleTranslationsDB";
const DB_TABLE_NAME = "translations";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DB_TABLE_NAME)) {
        db.createObjectStore(DB_TABLE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const getFromDB = async (id: string) => {
  const db = await openDB();
  return new Promise<Translation | null>((resolve, reject) => {
    const tx = db.transaction(DB_TABLE_NAME, "readonly");
    const store = tx.objectStore(DB_TABLE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export const saveToDB = async(id: string, value: Translation) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DB_TABLE_NAME, "readwrite");
    tx.objectStore(DB_TABLE_NAME).put({ id, ...value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const wordToKey = (word: string, language_target: string) => `${word}_${language_target}`;

export const getTranslationFromGoogle = async ({
  words,
  language_target,
  google_api_key,
}: {
  words: string[];
  language_target: string;
  google_api_key: string;
}): Promise<{
  translatedText: string;
}[]> => {
  const res = await axios.post(`${apiBaseURL}?key=${google_api_key}`, {
    q: words,
    source: "en",
    target: language_target,
    format: "text",
  });

  return res.data.data.translations;
};
