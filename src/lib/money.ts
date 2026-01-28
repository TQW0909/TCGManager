export type SupportedCurrency = "USD" | "CNY";

export function formatMoney(amount: number, currency: SupportedCurrency) {
  // Intl handles symbols + locale formatting. Use en-US for consistent output.
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
