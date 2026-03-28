import axios, { isAxiosError } from 'axios'
import type { AuthResponse, ExchangeRate, Transaction, TransferPayload } from '@/types'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT em toda requisição autenticada (OWASP A07)
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('onda-auth')
  if (raw) {
    const state = JSON.parse(raw)
    const token = state?.state?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

/** Extrai a mensagem de erro de uma resposta Axios. */
function extractMessage(err: unknown, fallback: string): never {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.message
    throw new Error(typeof msg === 'string' ? msg : fallback)
  }
  throw err
}

// --- Auth ---

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  } catch (err) {
    extractMessage(err, 'Erro ao fazer login')
  }
}

// --- Account ---

export async function getBalance(): Promise<number> {
  try {
    const { data } = await api.get<{ balance: number }>('/account/balance')
    return data.balance
  } catch (err) {
    extractMessage(err, 'Erro ao buscar saldo')
  }
}

// --- Transactions ---

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { data } = await api.get<{ transactions: Transaction[] }>('/transactions')
    return data.transactions
  } catch (err) {
    extractMessage(err, 'Erro ao buscar transações')
  }
}

// --- Exchange Rates ---

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const { data } = await api.get<{ rates: ExchangeRate[] }>('/exchange-rates')
    return data.rates
  } catch (err) {
    extractMessage(err, 'Erro ao buscar cotações')
  }
}

// --- Transfer ---

export async function postTransfer(
  payload: TransferPayload,
): Promise<{ newBalance: number; transaction: Transaction }> {
  try {
    const { data } = await api.post<{ newBalance: number; transaction: Transaction }>(
      '/transfers',
      payload,
    )
    return data
  } catch (err) {
    extractMessage(err, 'Erro ao processar transferência')
  }
}
