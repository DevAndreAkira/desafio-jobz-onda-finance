import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '@/pages/Login'
import { useAuthStore } from '@/stores/authStore'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock API
vi.mock('@/services/api', () => ({
  loginRequest: vi.fn(),
}))

import { loginRequest } from '@/services/api'
const mockLoginRequest = vi.mocked(loginRequest)

function renderLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ isAuthenticated: false, user: null, token: null })
    localStorage.clear()
  })

  it('renders the login form', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /entrar na sua conta/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty submission', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(screen.getByText(/informe o e-mail/i)).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no mínimo 6 caracteres/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/e-mail/i), 'not-an-email')
    await user.type(screen.getByPlaceholderText('••••••'), '123456')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument()
    })
  })

  it('shows error message on invalid credentials', async () => {
    const user = userEvent.setup()
    mockLoginRequest.mockRejectedValueOnce(new Error('Credenciais inválidas'))
    renderLogin()

    await user.type(screen.getByLabelText(/e-mail/i), 'wrong@email.com')
    await user.type(screen.getByPlaceholderText('••••••'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/credenciais inválidas/i)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('redirects to dashboard on successful login', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: 'usr_001',
      name: 'André Akira',
      email: 'user@onda.com',
      accountNumber: '12345-6',
      agency: '0001',
    }
    mockLoginRequest.mockResolvedValueOnce({ user: mockUser, token: 'mock_token' })
    renderLogin()

    await user.type(screen.getByLabelText(/e-mail/i), 'user@onda.com')
    await user.type(screen.getByPlaceholderText('••••••'), '123456')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByPlaceholderText('••••••')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    let resolveLogin: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => { resolveLogin = resolve })
    mockLoginRequest.mockReturnValueOnce(pendingPromise as ReturnType<typeof loginRequest>)
    renderLogin()

    await user.type(screen.getByLabelText(/e-mail/i), 'user@onda.com')
    await user.type(screen.getByPlaceholderText('••••••'), '123456')
    await user.click(screen.getByRole('button', { name: /^entrar$/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
    })

    // cleanup
    resolveLogin!({ user: {}, token: '' })
  })
})
