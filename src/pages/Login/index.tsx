import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Waves, Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { loginRequest } from '@/services/api'

// Limites (OWASP: previne enumeração e payload excessivo)
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000 // 30 segundos

const loginSchema = z.object({
  // RFC 5321: e-mail máx. 254 chars
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .max(254, 'E-mail muito longo')
    .email('E-mail inválido'),
  // Limitar senha: mín. 6, máx. 128 (previne DoS via bcrypt com senhas longas)
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(128, 'Senha muito longa'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil

  // Countdown regressivo durante o lockout
  useEffect(() => {
    if (lockedUntil === null) return
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setCountdown(0)
        setApiError(null)
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setCountdown(remaining)
      }
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [lockedUntil])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(data: LoginFormData) {
    if (isLocked) return
    setApiError(null)
    try {
      const response = await loginRequest(data.email, data.password)
      login(response.user, response.token)
      setFailedAttempts(0)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      const next = failedAttempts + 1
      setFailedAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        // Bloqueia por LOCKOUT_MS (OWASP A07: brute-force mitigation)
        setLockedUntil(Date.now() + LOCKOUT_MS)
        setApiError(null)
      } else {
        const remaining = MAX_ATTEMPTS - next
        setApiError(
          `${message}. ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`,
        )
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Waves className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Onda Finance</h1>
          <p className="text-sm text-muted-foreground">Seu banco digital simples e seguro</p>
        </div>

        {/* Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Use <strong>user@onda.com</strong> / <strong>123456</strong> para testar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* E-mail */}
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={254}
                  disabled={isLocked}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    autoComplete="current-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={128}
                    disabled={isLocked}
                    aria-invalid={!!errors.password}
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLocked}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Lockout banner */}
              {isLocked && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800"
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Muitas tentativas incorretas. Tente novamente em{' '}
                    <strong>{countdown}s</strong>.
                  </span>
                </div>
              )}

              {/* API Error */}
              {!isLocked && apiError && (
                <div
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {apiError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLocked}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : isLocked ? (
                  `Aguarde ${countdown}s`
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
