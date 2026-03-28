import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString))
}

/**
 * Mascara de conta bancária: NNNNN-N (máx. 6 dígitos → "12345-6")
 * Aceita apenas dígitos e insere o traço automaticamente.
 */
export function maskAccount(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

/**
 * Máscara de valor monetário estilo bancário (pt-BR).
 *
 * Funciona com base em centavos: os dígitos digitados sempre representam
 * os centavos mais à direita, avançando da direita para a esquerda.
 * Exemplo: "1" → "0,01" | "123" → "1,23" | "123456" → "1.234,56"
 *
 * Isso é o padrão dos principais apps bancários brasileiros (Nubank, Inter, etc.)
 * e elimina ambiguidade no separador decimal.
 *
 * Limite: 10 dígitos → máx. R$ 99.999.999,99
 */
export function maskCurrency(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (!digits) return ''
  const cents = parseInt(digits, 10)
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Converte o valor formatado por maskCurrency de volta para número.
 * "1.234,56" → 1234.56  |  "0,00000001" → 0.00000001
 */
export function parseCurrency(formatted: string): number {
  return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0
}

/**
 * Máscara para criptomoedas com N casas decimais.
 *
 * Diferente da maskCurrency (que trabalha com centavos inteiros), aqui
 * os dígitos digitados preenchem da direita para a esquerda usando a
 * quantidade de decimais da moeda. Máx. 5 dígitos inteiros (~99.999 BTC).
 *
 * BTC (8 decimais): "1" → "0,00000001" | "100000000" → "1,00000000"
 * ETH (6 decimais): "1" → "0,000001"   | "1500000"   → "1,500000"
 */
export function maskCrypto(raw: string, decimals: number): string {
  const digits = raw.replace(/\D/g, '').slice(0, 5 + decimals)
  if (!digits) return ''
  const padded = digits.padStart(decimals + 1, '0')
  const intPart = padded.slice(0, padded.length - decimals)
  const decPart = padded.slice(padded.length - decimals)
  const intFormatted = Number(intPart).toLocaleString('pt-BR')
  return `${intFormatted},${decPart}`
}

/**
 * Remove caracteres usados em ataques XSS/injection (OWASP A03).
 * Aplicado no onChange para impedir que dados maliciosos cheguem ao estado.
 */
export function sanitizeText(value: string): string {
  return value
    .replace(/[<>'"&;`\\]/g, '') // strip HTML/JS injection chars
    .replace(/javascript:/gi, '') // bloqueia URIs javascript:
    .replace(/on\w+\s*=/gi, '')   // bloqueia event handlers inline
}
