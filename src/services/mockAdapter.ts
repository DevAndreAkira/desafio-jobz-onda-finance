/**
 * Mock adapter para Axios — simula um servidor REST em desenvolvimento.
 * Em produção, remova este arquivo e aponte api.baseURL para a API real.
 */
import MockAdapter from 'axios-mock-adapter'
import { api } from './api'
import {
  MOCK_CREDENTIALS,
  MOCK_INITIAL_BALANCE,
  MOCK_RATES,
  MOCK_TOKEN,
  MOCK_TRANSACTIONS,
  MOCK_USER,
} from './mockData'

const mock = new MockAdapter(api, { onNoMatch: 'throwException' })

// POST /auth/login
mock.onPost('/auth/login').reply(async (config) => {
  await delay(800)
  const { email, password } = JSON.parse(config.data)
  if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
    return [200, { user: MOCK_USER, token: MOCK_TOKEN }]
  }
  return [401, { message: 'Credenciais inválidas' }]
})

// GET /account/balance
mock.onGet('/account/balance').reply(async () => {
  await delay(400)
  const stored = sessionStorage.getItem('onda-balance')
  const balance = stored ? parseFloat(stored) : MOCK_INITIAL_BALANCE
  return [200, { balance }]
})

// GET /transactions
mock.onGet('/transactions').reply(async () => {
  await delay(600)
  const stored = sessionStorage.getItem('onda-transactions')
  const transactions = stored ? JSON.parse(stored) : MOCK_TRANSACTIONS
  return [200, { transactions }]
})

// GET /exchange-rates
mock.onGet('/exchange-rates').reply(async () => {
  await delay(300)
  // Simula variação de ±0,5% a cada request para dar sensação de mercado ao vivo
  const rates = MOCK_RATES.map((r) => ({
    ...r,
    rate: parseFloat((r.rate * (1 + (Math.random() - 0.5) * 0.002)).toFixed(
      r.currency === 'BTC' ? 0 : r.currency === 'ETH' ? 0 : 2,
    )),
  }))
  return [200, { rates }]
})

// POST /transfers
mock.onPost('/transfers').reply(async (config) => {
  await delay(1000)
  const payload = JSON.parse(config.data)
  const stored = sessionStorage.getItem('onda-balance')
  const currentBalance = stored ? parseFloat(stored) : MOCK_INITIAL_BALANCE

  // Usa amountBRL (já convertido pelo cliente com a cotação vigente)
  const deductAmount = payload.amountBRL ?? payload.amount

  if (deductAmount <= 0) {
    return [400, { message: 'O valor deve ser maior que zero' }]
  }
  if (deductAmount > currentBalance) {
    return [422, { message: 'Saldo insuficiente' }]
  }

  const newBalance = parseFloat((currentBalance - deductAmount).toFixed(2))
  const isCrypto = ['BTC', 'ETH'].includes(payload.currency)
  const isInternational = ['USD', 'EUR'].includes(payload.currency)

  const category = isCrypto
    ? 'Cripto'
    : isInternational
      ? 'Transferência Internacional'
      : 'Transferência'

  const transaction = {
    id: `txn_${Date.now()}`,
    type: 'debit' as const,
    description:
      payload.description ||
      `Transferência para ${payload.recipientName}`,
    amount: deductAmount,
    currency: payload.currency,
    currencyAmount: payload.currency !== 'BRL' ? payload.amount : undefined,
    date: new Date().toISOString().split('T')[0],
    category,
    recipient: payload.recipientName,
  }

  sessionStorage.setItem('onda-balance', String(newBalance))
  const prevStored = sessionStorage.getItem('onda-transactions')
  const prev = prevStored ? JSON.parse(prevStored) : MOCK_TRANSACTIONS
  sessionStorage.setItem('onda-transactions', JSON.stringify([transaction, ...prev]))

  return [200, { newBalance, transaction }]
})

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { mock }
