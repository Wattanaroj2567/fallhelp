import { useEffect, useState, type ReactNode } from "react";
import { LANG_STORAGE_KEY, MESSAGES, initialLang, type Lang } from "./messages";
import { I18nContext } from "./useI18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => initialLang(localStorage.getItem(LANG_STORAGE_KEY)));

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t: MESSAGES[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
}
