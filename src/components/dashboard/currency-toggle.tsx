"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { Button } from "@/components/ui/button";

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  const toggleCurrency = () => {
    setCurrency(currency === "INR" ? "USD" : "INR");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleCurrency}
      className="font-medium w-16"
      title={`Switch to ${currency === 'INR' ? 'USD' : 'INR'}`}
    >
      {currency === "INR" ? "₹ INR" : "$ USD"}
    </Button>
  );
}
