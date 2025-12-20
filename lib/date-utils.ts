import { useTranslation } from "react-i18next";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, ptBR, fr, type Locale } from "date-fns/locale";

const locales: Record<string, Locale> = {
  en: enUS,
  pt: ptBR,
  fr: fr,
};

function getLocale(lang: string): Locale {
  const langCode = lang?.split("-")[0] || "en";
  return locales[langCode] || enUS;
}

export function useCurrentLocale() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  return locales[lang] || enUS;
}

export function useFormattedDate() {
  const locale = useCurrentLocale();
  
  return (date: Date | string, formatStr: string = "PPp") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, formatStr, { locale });
  };
}

export function useRelativeTime() {
  const locale = useCurrentLocale();
  
  return (date: Date | string, addSuffix: boolean = true) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { locale, addSuffix });
  };
}

// Non-hook versions for use outside of React components or when language is passed directly
export function formatRelativeTime(date: Date | string, lang: string = "en", addSuffix: boolean = true): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = getLocale(lang);
  return formatDistanceToNow(dateObj, { locale, addSuffix });
}

export function formatDateTime(date: Date | string, lang: string = "en", formatStr: string = "PPp"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = getLocale(lang);
  return format(dateObj, formatStr, { locale });
}
