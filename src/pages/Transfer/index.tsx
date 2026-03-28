import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Layout } from '@/components/Layout'
import { useAccountStore } from '@/stores/accountStore'
import { useTransfer } from '@/hooks/useTransfer'
import { getExchangeRates } from '@/services/api'
import { formatCurrency, maskAccount, maskCrypto, maskCurrency, parseCurrency, sanitizeText } from '@/lib/utils'
import type { Currency } from '@/types'

// --- Configuração de moedas ---

const CURRENCIES: { value: Currency; label: string; symbol: string; decimals: number }[] = [
  { value: 'BRL', label: 'BRL',  symbol: 'R$',  decimals: 2 },
  { value: 'USD', label: 'USD',  symbol: 'US$', decimals: 2 },
  { value: 'EUR', label: 'EUR',  symbol: '€',   decimals: 2 },
  { value: 'BTC', label: 'BTC',  symbol: '₿',   decimals: 8 },
  { value: 'ETH', label: 'ETH',  symbol: 'Ξ',   decimals: 6 },
]

// --- Limites e schema ---

const LIMITS = {
  recipientName: 80,
  recipientAccount: 7,
  amount: 13,
  description: 100,
} as const

const MAX_TRANSFER_BRL = 99_999_999.99
const SAFE_TEXT = /^[^<>'"&;`\\]*$/

const transferSchema = z.object({
  recipientName: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(LIMITS.recipientName, `Máximo ${LIMITS.recipientName} caracteres`)
    .regex(SAFE_TEXT, 'Caracteres inválidos no nome'),
  recipientAccount: z
    .string()
    .length(7, 'Formato inválido — use 12345-6')
    .regex(/^\d{5}-\d$/, 'Formato inválido — use 12345-6'),
  currency: z.enum(['BRL', 'USD', 'EUR', 'BTC', 'ETH'] as const),
  amount: z
    .string()
    .min(1, 'Informe o valor')
    .max(LIMITS.amount, 'Valor inválido')
    .refine((v) => parseCurrency(v) > 0, 'Valor deve ser maior que zero'),
  description: z
    .string()
    .max(LIMITS.description, `Máximo ${LIMITS.description} caracteres`)
    .regex(SAFE_TEXT, 'Caracteres inválidos na descrição')
    .optional(),
})

type TransferFormData = z.infer<typeof transferSchema>

export default function Transfer() {
  const navigate = useNavigate()
  const { balance } = useAccountStore()
  const { mutateAsync, isPending, isSuccess, isError, error, reset } = useTransfer()

  const { data: rates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: getExchangeRates,
    staleTime: 15_000,
  })

  const {
    control,
    handleSubmit,
    reset: resetForm,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientName: '',
      recipientAccount: '',
      currency: 'BRL',
      amount: '',
      description: '',
    },
  })

  const selectedCurrency = watch('currency')
  const amountValue = watch('amount')
  const parsedAmount = parseCurrency(amountValue ?? '')

  // Calcula equivalente em BRL (para moedas estrangeiras)
  const rate = rates?.find((r) => r.currency === selectedCurrency)?.rate ?? 1
  const amountBRL = selectedCurrency === 'BRL' ? parsedAmount : parsedAmount * rate

  const insufficientFunds = balance !== null && amountBRL > balance && amountBRL > 0
  const exceedsLimit = amountBRL > MAX_TRANSFER_BRL

  const currencyMeta = CURRENCIES.find((c) => c.value === selectedCurrency)!

  async function onSubmit(data: TransferFormData) {
    try {
      await mutateAsync({
        recipientName: data.recipientName.trim(),
        recipientAccount: data.recipientAccount,
        amount: parseCurrency(data.amount),
        currency: data.currency,
        amountBRL,
        description: data.description?.trim() || '',
      })
    } catch {
      // handled by mutation state
    }
  }

  function handleNewTransfer() {
    reset()
    resetForm()
  }

  if (isSuccess) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="pt-10 pb-8 flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Transferência realizada!</h2>
                <p className="text-muted-foreground text-sm">
                  Seu saldo foi atualizado com sucesso.
                </p>
                {balance !== null && (
                  <p className="text-sm font-medium mt-2">
                    Novo saldo:{' '}
                    <span className="text-primary font-bold">{formatCurrency(balance)}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Ver extrato
                </Button>
                <Button onClick={handleNewTransfer}>Nova transferência</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Transferência</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Envie BRL, cripto ou moedas internacionais de forma rápida e segura
          </p>
        </div>

        {/* Balance info */}
        {balance !== null && (
          <Card className="bg-muted/40">
            <CardContent className="py-3 px-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo disponível</span>
              <span className="font-semibold">{formatCurrency(balance)}</span>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowLeftRight className="h-5 w-5" />
              Dados da transferência
            </CardTitle>
            <CardDescription>Preencha os dados do destinatário</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              autoComplete="off"
              className="space-y-4"
            >
              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="recipientName">Nome do destinatário</Label>
                <Controller
                  name="recipientName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="recipientName"
                      placeholder="João da Silva"
                      maxLength={LIMITS.recipientName}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="words"
                      spellCheck={false}
                      aria-invalid={!!errors.recipientName}
                      onChange={(e) => field.onChange(sanitizeText(e.target.value))}
                    />
                  )}
                />
                {errors.recipientName && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.recipientName.message}
                  </p>
                )}
              </div>

              {/* Conta */}
              <div className="space-y-1.5">
                <Label htmlFor="recipientAccount">
                  Conta{' '}
                  <span className="text-muted-foreground font-normal text-xs">(formato: 12345-6)</span>
                </Label>
                <Controller
                  name="recipientAccount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="recipientAccount"
                      placeholder="12345-6"
                      inputMode="numeric"
                      maxLength={LIMITS.recipientAccount}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-invalid={!!errors.recipientAccount}
                      aria-describedby="account-hint"
                      onChange={(e) => field.onChange(maskAccount(e.target.value))}
                    />
                  )}
                />
                <p id="account-hint" className="text-xs text-muted-foreground">
                  Digite apenas os números — o traço é inserido automaticamente
                </p>
                {errors.recipientAccount && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.recipientAccount.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Seletor de moeda */}
              <div className="space-y-1.5">
                <Label>Moeda</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar moeda">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            field.onChange(c.value)
                            setValue('amount', '') // limpa o valor ao trocar moeda
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                            field.value === c.value
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-input hover:bg-accent'
                          }`}
                          aria-pressed={field.value === c.value}
                        >
                          {c.symbol} {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Valor */}
              <div className="space-y-1.5">
                <Label htmlFor="amount">
                  Valor{' '}
                  <span className="text-muted-foreground font-normal">
                    ({currencyMeta.symbol} {selectedCurrency})
                  </span>
                </Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="amount"
                      placeholder="0,00"
                      inputMode="decimal"
                      maxLength={LIMITS.amount}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={!!errors.amount || insufficientFunds}
                      onChange={(e) => {
                        const isCrypto = selectedCurrency === 'BTC' || selectedCurrency === 'ETH'
                        field.onChange(
                          isCrypto
                            ? maskCrypto(e.target.value, currencyMeta.decimals)
                            : maskCurrency(e.target.value),
                        )
                      }}
                    />
                  )}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.amount.message}
                  </p>
                )}
                {!errors.amount && insufficientFunds && (
                  <p className="text-xs text-destructive" role="alert">
                    Saldo insuficiente
                  </p>
                )}
                {!errors.amount && exceedsLimit && (
                  <p className="text-xs text-destructive" role="alert">
                    Valor excede o limite permitido
                  </p>
                )}
                {/* Equivalente em BRL para moedas estrangeiras */}
                {selectedCurrency !== 'BRL' && parsedAmount > 0 && rate && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatCurrency(amountBRL)} · cotação: {formatCurrency(rate)}/{selectedCurrency}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">
                    Descrição{' '}
                    <span className="text-muted-foreground font-normal">(opcional)</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {watch('description')?.length ?? 0}/{LIMITS.description}
                  </span>
                </div>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="description"
                      placeholder="Ex: Pagamento freelance"
                      maxLength={LIMITS.description}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={!!errors.description}
                      onChange={(e) => field.onChange(sanitizeText(e.target.value))}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* API Error */}
              {isError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error instanceof Error ? error.message : 'Erro ao processar transferência'}
                </div>
              )}

              {/* Confirmação */}
              {amountBRL > 0 && !insufficientFunds && !exceedsLimit && (
                <div className="rounded-md bg-primary/5 px-3 py-2 text-sm text-center space-y-0.5">
                  <p>
                    Você está enviando{' '}
                    <strong className="text-primary">
                      {currencyMeta.symbol} {parsedAmount.toLocaleString('pt-BR', {
                        minimumFractionDigits: currencyMeta.decimals,
                        maximumFractionDigits: currencyMeta.decimals,
                      })} {selectedCurrency}
                    </strong>
                  </p>
                  {selectedCurrency !== 'BRL' && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency(amountBRL)} debitados do seu saldo
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isPending || insufficientFunds || exceedsLimit}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Transferir'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
