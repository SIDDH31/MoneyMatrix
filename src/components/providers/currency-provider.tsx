"use client";

import React, { createContext, useContext, useState } from "react";
import { updateCurrencyPreference } from "@/actions/profile";
import { toast } from "sonner";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR",
  setCurrency: () => {},
});

export function CurrencyProvider({
  children,
  initialCurrency,
}: {
  children: React.ReactNode;
  initialCurrency: string;
}) {
  const [currency, setCurrencyState] = useState<string>(initialCurrency);

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    try {
      await updateCurrencyPreference(newCurrency);
      toast.success(`Currency changed to ${newCurrency}`);
    } catch (error) {
      toast.error("Failed to save currency preference");
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
