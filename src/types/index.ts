export interface User {
  id: string
  name: string
  email: string
  accountNumber: string
  agency: string
}

export type Currency = 'BRL' | 'USD' | 'EUR' | 'BTC' | 'ETH'

export interface ExchangeRate {
  currency: Exclude<Currency, 'BRL'>
  symbol: string
  name: string
  rate: number       // 1 unidade em BRL
  change24h: number  // variação % nas últimas 24h
}

export interface Transaction {
  id: string
  type: 'credit' | 'debit'
  description: string
  amount: number          // sempre em BRL
  currency: Currency      // moeda de origem da transação
  currencyAmount?: number // valor na moeda de origem (quando não-BRL)
  date: string
  category: string
  recipient?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface TransferPayload {
  recipientName: string
  recipientAccount: string
  amount: number      // valor na moeda selecionada
  currency: Currency
  amountBRL: number   // equivalente em BRL (calculado no cliente)
  description: string
}

export interface ApiError {
  message: string
  code?: string
}
