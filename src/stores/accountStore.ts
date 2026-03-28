import { create } from 'zustand'
import type { Transaction } from '@/types'

interface AccountState {
  balance: number | null
  transactions: Transaction[]
  balanceVisible: boolean
  setBalance: (balance: number) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  deductBalance: (amount: number) => void
  toggleBalanceVisible: () => void
}

export const useAccountStore = create<AccountState>()((set) => ({
  balance: null,
  transactions: [],
  balanceVisible: true,
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  deductBalance: (amount) =>
    set((state) => ({
      balance: state.balance !== null
        ? parseFloat((state.balance - amount).toFixed(2))
        : null,
    })),
  toggleBalanceVisible: () =>
    set((state) => ({ balanceVisible: !state.balanceVisible })),
}))
