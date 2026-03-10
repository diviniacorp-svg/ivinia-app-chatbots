import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateChatbotId(): string {
  // crypto.randomUUID es criptográficamente seguro (Node 14.17+ / browsers modernos)
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
}

export function generateEmbedCode(chatbotId: string, appUrl: string): string {
  return `<script src="${appUrl}/widget.js" data-id="${chatbotId}" defer></script>`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function daysUntil(dateString: string): number {
  const target = new Date(dateString)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
