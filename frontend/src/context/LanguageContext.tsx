import React, { createContext, useContext, useState } from "react";
import { getTranslation } from "../utils/translations";

type Language = "en" | "hi" | "te";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  getVoiceLocale: () => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync with localStorage so the user settings persist
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("selected_language");
    return (saved === "en" || saved === "hi" || saved === "te" ? saved : "en") as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selected_language", lang);
  };

  const t = (key: string, fallback?: string) => {
    return getTranslation(language, key, fallback || key);
  };

  const getVoiceLocale = () => {
    switch (language) {
      case "hi":
        return "hi-IN";
      case "te":
        return "te-IN";
      default:
        return "en-IN";
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getVoiceLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
