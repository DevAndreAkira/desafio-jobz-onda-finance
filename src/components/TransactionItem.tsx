import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Currency, Transaction } from '@/types'

const CURRENCY_LABELS: Record<Exclude<Currency, 'BRL'>, { symbol: string; decimals: number }> = {
  USD: { symbol: 'US$', decimals: 2 },
  EUR: { symbol: '€',   decimals: 2 },
  BTC: { symbol: '₿',   decimals: 8 },
  ETH: { symbol: 'Ξ',   decimals: 6 },
}

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.type === 'credit'
  const isForeign = transaction.currency !== 'BRL'
  const currencyMeta = isForeign ? CURRENCY_LABELS[transaction.currency as Exclude<Currency, 'BRL'>] : null

  const foreignLabel =
    currencyMeta && transaction.currencyAmount !== undefined
      ? `${currencyMeta.symbol} ${transaction.currencyAmount.toLocaleString('pt-BR', {
          minimumFractionDigits: currencyMeta.decimals,
          maximumFractionDigits: currencyMeta.decimals,
        })}`
      : null

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isCredit ? 'bg-emerald-100' : 'bg-red-100'
          }`}
        >
          {isCredit ? (
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{transaction.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
            </span>
            <Badge variant="outline" className="text-[10px] py-0 h-4">
              {transaction.category}
            </Badge>
            {foreignLabel && (
              <Badge variant="secondary" className="text-[10px] py-0 h-4 font-mono">
                {transaction.currency} {foreignLabel.split(' ')[1]}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="ml-4 shrink-0 text-right">
        <span
          className={`block text-sm font-semibold ${
            isCredit ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {isCredit ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
        {foreignLabel && (
          <span className="block text-[10px] text-muted-foreground font-mono">
            {foreignLabel}
          </span>
        )}
      </div>
    </div>
  )
}
