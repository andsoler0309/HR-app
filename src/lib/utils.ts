import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInBusinessDays, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateToken(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars.charAt(x % chars.length))
    .join('')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function calculateDays(startDate: string, endDate: string): number {
  return differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1
}
