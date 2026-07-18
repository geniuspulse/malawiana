import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-MW', { year: 'numeric', month: 'long', day: 'numeric' })
}
export function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`
  return `${Math.floor(seconds/86400)}d ago`
}
