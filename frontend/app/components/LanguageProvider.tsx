"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, getToken } from "../lib/api";

export type AppLanguage = "zh-CN" | "pt-BR";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeLanguage(value: unknown): AppLanguage {
  return value === "pt-BR" ? "pt-BR" : "zh-CN";
}

export function pickLanguageText(text: string, language: AppLanguage) {
  if (!text) return text;
  const parts = text.split(" / ");
  if (parts.length < 2) return text;
  const selected = language === "pt-BR" ? parts.slice(1).join(" / ") : parts[0];
  return selected.trim() || text;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("zh-CN");

  useEffect(() => {
    const stored = normalizeLanguage(window.localStorage.getItem("app_language"));
    setLanguageState(stored);
    if (!getToken()) return;
    apiFetch<{ language?: string }>("/me")
      .then((me) => {
        const next = normalizeLanguage(me.language);
        setLanguageState(next);
        window.localStorage.setItem("app_language", next);
      })
      .catch(() => undefined);
  }, []);

  async function setLanguage(nextLanguage: AppLanguage) {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("app_language", nextLanguage);
    if (getToken()) {
      await apiFetch("/me/language", { method: "PATCH", body: JSON.stringify({ language: nextLanguage }) });
    }
  }

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (text: string) => pickLanguageText(text, language)
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      <LanguageDomNormalizer language={language} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

function LanguageDomNormalizer({ language }: { language: AppLanguage }) {
  const textOriginals = useRef(new WeakMap<Text, string>());
  const attrOriginals = useRef(new WeakMap<Element, Record<string, string>>());

  useEffect(() => {
    const normalize = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        const parentName = node.parentElement?.tagName.toLowerCase();
        if (!["script", "style", "textarea"].includes(parentName || "")) {
          const original = textOriginals.current.get(node) || node.nodeValue || "";
          if (original.includes(" / ")) {
            textOriginals.current.set(node, original);
            const nextValue = pickLanguageText(original, language);
            if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
          }
        }
        node = walker.nextNode() as Text | null;
      }

      document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
        const originals = attrOriginals.current.get(element) || {};
        ["placeholder", "aria-label", "title"].forEach((attribute) => {
          const value = originals[attribute] || element.getAttribute(attribute) || "";
          if (value.includes(" / ")) {
            originals[attribute] = value;
            const nextValue = pickLanguageText(value, language);
            if (element.getAttribute(attribute) !== nextValue) element.setAttribute(attribute, nextValue);
          }
        });
        attrOriginals.current.set(element, originals);
      });
    };

    normalize();
    const observer = new MutationObserver(normalize);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] });
    return () => observer.disconnect();
  }, [language]);

  return null;
}
