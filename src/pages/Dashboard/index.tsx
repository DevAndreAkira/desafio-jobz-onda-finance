import { Eye, EyeOff, TrendingUp, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Layout } from '@/components/Layout'
import { TransactionItem } from '@/components/TransactionItem'
import { ExchangeRates } from '@/components/ExchangeRates'
import { useAuthStore } from '@/stores/authStore'
import { useAccountStore } from '@/stores/accountStore'
import { useAccountData } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { balance, transactions, balanceVisible, toggleBalanceVisible } = useAccountStore()
  const { isLoading, isError, refetch } = useAccountData()

  const credits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const debits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold">Olá, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Agência {user?.agency} · Conta {user?.accountNumber}
          </p>
        </div>

        {/* Balance + stats row */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Balance card */}
          <Card className="md:col-span-1 bg-gradient-to-br from-primary to-blue-700 text-white border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-200 text-xs uppercase tracking-wider font-medium">
                Saldo disponível · BRL
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 w-40 animate-pulse rounded bg-white/20" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold tracking-tight">
                    {balanceVisible
                      ? balance !== null
                        ? formatCurrency(balance)
                        : '—'
                      : 'R$ ••••••'}
                  </span>
                  <button
                    onClick={toggleBalanceVisible}
                    className="text-blue-200 hover:text-white transition-colors"
                    aria-label={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
                  >
                    {balanceVisible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              )}
              <Link to="/transfer">
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 gap-1 bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  Transferir <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Income */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                Entradas no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-28 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(credits)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1 text-xs">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                Saídas no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-28 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(debits)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exchange Rates */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <ExchangeRates />
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Extrato</CardTitle>
              <CardDescription>Suas últimas movimentações</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent className="px-3">
            {isError && (
              <p className="text-sm text-destructive text-center py-4">
                Erro ao carregar transações.
              </p>
            )}

            {isLoading && (
              <div className="space-y-3 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-1">
                    <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !isError && transactions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma transação encontrada.
              </p>
            )}

            {!isLoading && !isError && transactions.length > 0 && (
              <div>
                {transactions.map((transaction, index) => (
                  <div key={transaction.id}>
                    <TransactionItem transaction={transaction} />
                    {index < transactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
