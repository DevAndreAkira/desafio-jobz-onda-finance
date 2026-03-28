import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Waves } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <Waves className="h-12 w-12 text-primary opacity-50" />
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl font-semibold">Página não encontrada</p>
        <p className="text-muted-foreground text-sm">
          A página que você procura não existe.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Voltar ao início</Link>
      </Button>
    </div>
  )
}
