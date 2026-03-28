import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postTransfer } from '@/services/api'
import { useAccountStore } from '@/stores/accountStore'
import type { TransferPayload } from '@/types'

export function useTransfer() {
  const queryClient = useQueryClient()
  const { setBalance, addTransaction } = useAccountStore()

  return useMutation({
    mutationFn: (payload: TransferPayload) => postTransfer(payload),
    onSuccess: ({ newBalance, transaction }) => {
      setBalance(newBalance)
      addTransaction(transaction)
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
