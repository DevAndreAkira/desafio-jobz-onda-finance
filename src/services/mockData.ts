import type { ExchangeRate, Transaction, User } from '@/types'

export const MOCK_USER: User = {
  id: 'usr_001',
  name: 'André Akira',
  email: 'user@onda.com',
  accountNumber: '12345-6',
  agency: '0001',
}

export const MOCK_TOKEN = 'mock_jwt_token_xyz_123'

export const MOCK_CREDENTIALS = {
  email: 'user@onda.com',
  password: '123456',
}

export const MOCK_INITIAL_BALANCE = 14_820.35

// Cotações mock em BRL (referência: março/2026)
export const MOCK_RATES: ExchangeRate[] = [
  { currency: 'BTC', symbol: '₿', name: 'Bitcoin',  rate: 520_000, change24h: 2.4  },
  { currency: 'ETH', symbol: 'Ξ', name: 'Ethereum', rate: 18_500,  change24h: 1.8  },
  { currency: 'USD', symbol: '$', name: 'Dólar',     rate: 5.82,    change24h: 0.3  },
  { currency: 'EUR', symbol: '€', name: 'Euro',      rate: 6.31,    change24h: -0.1 },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    type: 'credit',
    description: 'Recebimento — João Mueller (EUA)',
    amount: 29_100,
    currency: 'USD',
    currencyAmount: 5_000,
    date: '2026-03-01',
    category: 'Transferência Internacional',
  },
  {
    id: 'txn_002',
    type: 'debit',
    description: 'Compra Bitcoin',
    amount: 5_200,
    currency: 'BTC',
    currencyAmount: 0.01,
    date: '2026-03-05',
    category: 'Cripto',
  },
  {
    id: 'txn_003',
    type: 'credit',
    description: 'Venda Ethereum',
    amount: 3_700,
    currency: 'ETH',
    currencyAmount: 0.2,
    date: '2026-03-08',
    category: 'Cripto',
  },
  {
    id: 'txn_004',
    type: 'debit',
    description: 'Transferência — Maria García (ESP)',
    amount: 6_310,
    currency: 'EUR',
    currencyAmount: 1_000,
    date: '2026-03-12',
    category: 'Transferência Internacional',
  },
  {
    id: 'txn_005',
    type: 'credit',
    description: 'Freelance — TechCorp Inc.',
    amount: 2_910,
    currency: 'USD',
    currencyAmount: 500,
    date: '2026-03-15',
    category: 'Renda Internacional',
  },
  {
    id: 'txn_006',
    type: 'debit',
    description: 'Compra Ethereum',
    amount: 1_850,
    currency: 'ETH',
    currencyAmount: 0.1,
    date: '2026-03-18',
    category: 'Cripto',
  },
  {
    id: 'txn_007',
    type: 'debit',
    description: 'Assinatura — AWS Cloud Services',
    amount: 523.8,
    currency: 'USD',
    currencyAmount: 90,
    date: '2026-03-20',
    category: 'Serviço Internacional',
  },
  {
    id: 'txn_008',
    type: 'credit',
    description: 'Reembolso — Conferência Web3',
    amount: 1_200,
    currency: 'BRL',
    date: '2026-03-22',
    category: 'Reembolso',
  },
]
