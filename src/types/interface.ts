import { createContext, useContext, useEffect } from "react";

export interface Translation {
  word: string;
  translation: string;
  target: string;
};

/** Props for GoogleTranslateClientOptions 
  @param google_api_key - Google cloud API key
  @param language_target - The target language to translate to
*/
export interface GoogleTranslateClientOptions {
  google_api_key: string;
  language_target: string;
}

export interface GoogleTranslateContextProps {
  /**
   * Translate a single word. Returns the untranslated word immediately, and updates later when translation is ready.
   * @param word - The word to translate
   * @param disable_fetch - Set to true to disable fetching from the api and rely on database only.
   * @example googleTranslate("hello")
  */
  googleTranslate: (word: string, disable_fetch?: boolean) => string;
  /**
   * Short alias for googleTranslate function. Translate a single word. Returns the untranslated word immediately, and updates later when translation is ready.
   * @param word - The word to translate
   * @param disable_fetch - Set to true to disable fetching from the api and rely on database only.
   * @example gt("hello")
  */
  gt: (word: string, disable_fetch?: boolean) => string;
};

/** Props for GoogleTranslateProvider 
  @param children - The children to render
  @param language_target - The target language to translate to
  @param google_api_key - Google cloud API key
*/
export interface GoogleTranslateProviderProps {
  children: React.ReactNode;
  language_target: string;
  google_api_key: string;
};

export const GoogleTranslateContext = createContext<GoogleTranslateContextProps | null>(null);

export function useGoogleTranslate(): GoogleTranslateContextProps {
  const context = useContext(GoogleTranslateContext);

  useEffect(function onDidMount() {
    if (!context) {
      console.error('useGoogleTranslate must be used within GoogleTranslateProvider');
    }
  });

  return context as GoogleTranslateContextProps;
};
