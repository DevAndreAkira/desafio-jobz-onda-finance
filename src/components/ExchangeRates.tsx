import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { getExchangeRates } from '@/services/api'
import { cn } from '@/lib/utils'

export function ExchangeRates() {
  const { data: rates, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: getExchangeRates,
    refetchInterval: 30_000, // atualiza a cada 30s
    staleTime: 15_000,
  })

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Cotações ao vivo
        </p>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Atualizar cotações"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-3 space-y-1.5">
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-10 animate-pulse rounded bg-muted" />
              </div>
            ))
          : rates?.map((rate) => (
              <RateCard key={rate.currency} rate={rate} />
            ))}
      </div>
    </div>
  )
}

function RateCard({ rate }: { rate: NonNullable<ReturnType<typeof useQuery<ReturnType<typeof getExchangeRates> extends Promise<infer T> ? T : never>>['data']>[number] }) {
  const up = rate.change24h >= 0

  const formatted =
    rate.currency === 'BTC' || rate.currency === 'ETH'
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(rate.rate)
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rate.rate)

  return (
    <div className="rounded-lg border bg-card p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">
          {rate.symbol} {rate.currency}
        </span>
        <span
          className={cn(
            'flex items-center gap-0.5 text-[10px] font-semibold',
            up ? 'text-emerald-600' : 'text-red-600',
          )}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? '+' : ''}{rate.change24h.toFixed(1)}%
        </span>
      </div>
      <p className="mt-1 text-sm font-bold">{formatted}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{rate.name}</p>
    </div>
  )
}
