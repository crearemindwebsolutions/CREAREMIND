import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  AED: { code: "AED", symbol: "AED ", name: "UAE Dirham", flag: "🇦🇪" },
};

export interface PlanPricing {
  monthly: number;
  annual: number;
}

export const PLAN_PRICES: Record<string, Record<CurrencyCode, PlanPricing>> = {
  "Starter Web": {
    INR: { monthly: 14999, annual: 11999 },
    USD: { monthly: 499, annual: 399 },
    EUR: { monthly: 459, annual: 369 },
    GBP: { monthly: 399, annual: 319 },
    AED: { monthly: 1849, annual: 1479 },
  },
  "Growth App": {
    INR: { monthly: 29999, annual: 23999 },
    USD: { monthly: 999, annual: 799 },
    EUR: { monthly: 919, annual: 739 },
    GBP: { monthly: 799, annual: 639 },
    AED: { monthly: 3699, annual: 2959 },
  },
  "Full Retainer": {
    INR: { monthly: 59999, annual: 47999 },
    USD: { monthly: 1499, annual: 1199 },
    EUR: { monthly: 1379, annual: 1099 },
    GBP: { monthly: 1199, annual: 959 },
    AED: { monthly: 5549, annual: 4439 },
  },
  "Enterprise Custom": {
    INR: { monthly: 119999, annual: 95999 },
    USD: { monthly: 2499, annual: 1999 },
    EUR: { monthly: 2299, annual: 1839 },
    GBP: { monthly: 1999, annual: 1599 },
    AED: { monthly: 9249, annual: 7399 },
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  symbol: string;
  config: CurrencyConfig;
  formatPrice: (amount: number, code?: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR",
  setCurrency: () => {},
  symbol: "₹",
  config: CURRENCIES.INR,
  formatPrice: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
});

const STORAGE_KEY = "creare_mind_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Always default to INR
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      } else {
        localStorage.setItem(STORAGE_KEY, "INR");
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // Ignore
      }
    }
  };

  const formatPrice = (amount: number, code = currency) => {
    const cfg = CURRENCIES[code] || CURRENCIES.INR;
    if (code === "INR") {
      return `${cfg.symbol}${amount.toLocaleString("en-IN")}`;
    }
    return `${cfg.symbol}${amount.toLocaleString("en-US")}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol: CURRENCIES[currency].symbol,
        config: CURRENCIES[currency],
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
