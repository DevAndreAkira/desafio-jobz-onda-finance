import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getBalance, getTransactions } from '@/services/api'
import { useAccountStore } from '@/stores/accountStore'

export function useAccountData() {
  const { setBalance, setTransactions } = useAccountStore()

  const balanceQuery = useQuery({
    queryKey: ['balance'],
    queryFn: getBalance,
    staleTime: 0,
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
    staleTime: 0,
  })

  useEffect(() => {
    if (balanceQuery.data !== undefined) {
      setBalance(balanceQuery.data)
    }
  }, [balanceQuery.data, setBalance])

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions(transactionsQuery.data)
    }
  }, [transactionsQuery.data, setTransactions])

  return {
    isLoading: balanceQuery.isLoading || transactionsQuery.isLoading,
    isError: balanceQuery.isError || transactionsQuery.isError,
    refetch: () => {
      balanceQuery.refetch()
      transactionsQuery.refetch()
    },
  }
}
