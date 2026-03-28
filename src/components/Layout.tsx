import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, LogOut, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transfer', label: 'Transferência', icon: ArrowLeftRight },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Waves className="h-6 w-6" />
            <span>Onda Finance</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant={pathname === to ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">
              Olá, <strong className="text-foreground">{user?.name.split(' ')[0]}</strong>
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="sm:hidden border-b bg-white px-4 py-2 flex gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex-1">
            <Button
              variant={pathname === to ? 'default' : 'ghost'}
              size="sm"
              className={cn('w-full gap-2 justify-center')}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 container py-6">{children}</main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Onda Finance — Desafio Front-End
      </footer>
    </div>
  )
}
