const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export function formatCurrency(amount: number): string {
  return formatter.format(amount);
}

// Format compact pour les axes/labels de graphiques (ex: 1,2 k €, 1,5 M €)
const compactFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrencyCompact(amount: number): string {
  return compactFormatter.format(amount);
}
