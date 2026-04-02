import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function calculateProfit(mrp: number, cost: number) {
  if (cost === 0) return 0;
  return ((mrp - cost) / cost) * 100;
}

export function getProfitColor(margin: number) {
  if (margin > 20) return 'text-green-600';
  if (margin >= 10) return 'text-yellow-600';
  return 'text-red-600';
}
