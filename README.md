# Onda Finance 🌊

App bancário simulado com pagamentos internacionais e cripto — desenvolvido como desafio técnico front-end.

**[→ Acessar aplicação](https://desafio-onda-finance.vercel.app/login)**

> Credenciais de acesso: `user@onda.com` / `123456`

---

## Checklist do desafio

### Stack obrigatória
- [x] **React + TypeScript** — strict mode, tipos centralizados em `src/types/`
- [x] **Vite** — build tool com HMR e path alias `@/`
- [x] **Tailwind + CVA** — design system com variantes type-safe
- [x] **shadcn/ui + Radix** — componentes headless com acessibilidade nativa
- [x] **React Router** — rotas protegidas via `<ProtectedRoute>` com `<Outlet />`
- [x] **React Query** — cache, loading/error state e invalidação automática após transferência
- [x] **Zustand** — `authStore` (persist) e `accountStore` (memória)
- [x] **React Hook Form + Zod** — validação schema-first com resolver
- [x] **Axios** — instância com interceptor JWT + `axios-mock-adapter` para simular API REST real
- [x] **Vitest** — 7 testes cobrindo o fluxo de login

### Funcionalidades
- [x] Login com mock e persistência de sessão (localStorage via Zustand persist)
- [x] Dashboard com saldo, toggle de visibilidade e extrato com skeleton loading
- [x] Cotações ao vivo: BTC, ETH, USD, EUR com auto-refresh a cada 30s e variação 24h simulada
- [x] Transferência com formulário validado e saldo atualizado em tela
- [x] Seletor de moeda: BRL, USD, EUR, BTC, ETH — com equivalente em BRL em tempo real
- [x] Extrato com badge de moeda original e valor convertido por transação
- [x] Máscara bancária estilo Nubank/Inter: dígitos preenchem da direita (centavos) pra esquerda
- [x] Máscara de cripto parametrizada: BTC com 8 decimais, ETH com 6 decimais

### Entrega
- [x] README com instruções, decisões técnicas e melhorias futuras
- [x] Testes (fluxo de login — 7 casos)
- [x] Segurança documentada (engenharia reversa + vazamento de dados)
- [x] **Aplicação publicada** — [desafio-onda-finance.vercel.app](https://desafio-onda-finance.vercel.app/login)

---

## Como rodar

```bash
git clone https://github.com/seu-usuario/onda-finance.git
cd onda-finance
npm install
npm run dev        # http://localhost:5173
npm run test:run   # executa os 7 testes
npm run build      # build de produção
```

---

## Arquitetura

```
src/
├── components/ui/   # Design system: Button (CVA), Card, Input, Badge, Skeleton...
├── components/      # Layout, ProtectedRoute, TransactionItem, ExchangeRates
├── hooks/           # useAccountData, useTransfer — React Query desacoplado dos componentes
├── pages/           # Login, Dashboard, Transfer, NotFound
├── services/        # api.ts (Axios), mockAdapter.ts, mockData.ts
├── stores/          # authStore (persist), accountStore (memória)
├── types/           # Interfaces compartilhadas: User, Transaction, Currency, ExchangeRate...
└── lib/             # utils: cn, formatCurrency, maskCurrency, maskCrypto, sanitizeText
```

**Princípio central:** componentes não sabem de onde os dados vêm — `hooks/` busca, `stores/` guarda, `pages/` exibe.

---

## Decisões técnicas

| Decisão | Raciocínio |
|---|---|
| **CVA para variantes** | Erro de compilação se passar variante inexistente — design system type-safe, sem strings mágicas |
| **Radix UI** | Acessibilidade nativa (ARIA, navegação por teclado, foco gerenciado) sem implementar manualmente |
| **React Query `invalidateQueries`** | Após transferência, saldo e extrato se sincronizam automaticamente via invalidação de cache — sem prop drilling |
| **Zustand `partialize`** | Persiste só `{ user, token, isAuthenticated }` no localStorage — dados financeiros nunca são serializados |
| **`axios-mock-adapter`** | Intercepta chamadas HTTP reais do Axios; remover o adapter em produção não exige tocar nos componentes |
| **`Controller` no RHF** | Máscaras precisam interceptar o `onChange` nativo — `register` simples seria sobrescrito pelo RHF |
| **Máscara bancária** | Dígitos tratados como centavos da direita pra esquerda: `"123"` → `"1,23"` — padrão Nubank/Inter, elimina ambiguidade no separador |
| **`maskCrypto(raw, decimals)`** | BTC exige 8 casas, ETH 6 — função parametrizada com `padStart` evita duplicação de lógica |
| **Import dinâmico condicional** | `mockAdapter` só carregado quando `MODE !== 'production'` — dados e rotas mock não existem no bundle publicado |
| **`extractMessage()`** | Stack traces e detalhes internos da API nunca chegam ao usuário — mensagens de erro são sempre controladas |

---

## Segurança

### Implementado no código

**Contra injeção — OWASP A03**
- `sanitizeText()` remove `< > ' " & ; \ \`` em todo `onChange` de campo de texto livre — dados maliciosos nunca chegam ao estado do React
- Regex `SAFE_TEXT = /^[^<>'"&;`\\]*$/` no schema Zod como segunda camada independente — se o `onChange` for bypassado via DevTools, o submit ainda é bloqueado
- Duas camadas independentes: sanitização no cliente + validação no schema

**Contra brute-force — OWASP A07**
- 5 tentativas de login erradas → lockout de 30s com countdown regressivo visível
- Campos e botão desabilitados durante o bloqueio — impossível submeter via UI

**Limites de payload**
- Senha: `max(128)` — previne DoS via bcrypt com senhas longas (hash de string gigante é O(n))
- E-mail: `max(254)` — limite RFC 5321
- Defesa em profundidade: `maxLength` no HTML **e** `max()` no Zod — nenhuma camada depende da outra

**Atributos de input**
- `autoComplete="off"`, `autoCorrect="off"`, `spellCheck={false}` em campos sensíveis — impede preenchimento indevido e vazamento de dados para serviços de terceiros

**Token e sessão**
- Token JWT lido do localStorage em runtime pelo interceptor Axios — nunca hardcoded no bundle
- `partialize` no Zustand persist — só o mínimo é salvo; saldo e transações vivem apenas em memória
- `logout()` limpa sessionStorage + resets completo do Zustand store

**Bundle**
- `mockAdapter` excluído via import dinâmico condicional — lógica interna e dados mock não existem no artefato publicado
- Vite minifica, ofusca nomes de variáveis e faz tree-shaking automaticamente

---

### O que protegeria em produção

**Contra engenharia reversa**
- Ofuscação avançada com `vite-plugin-obfuscator` (mangleProps, renaming agressivo de identificadores)
- Code splitting com `React.lazy` para dificultar análise estática do bundle completo
- Lógica de negócio crítica sempre no backend — cliente só exibe, nunca calcula saldo real

**Contra vazamento de dados**
- Token em `httpOnly cookie` em vez de localStorage — inacessível via JavaScript, previne XSS token theft
- HTTPS + HSTS obrigatório em produção
- Headers HTTP de segurança: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- Rate limiting real no servidor — o lockout de 5 tentativas no cliente é bypassável via requisição direta
- Senhas com `bcrypt` (custo ≥ 12) ou `argon2id` — nunca em texto plano
- Logs sem senhas, tokens ou dados financeiros completos

---

## Testes

Fluxo coberto: **Login** — `src/test/login.test.tsx`

| Caso de teste | O que valida |
|---|---|
| `renders the login form` | Elementos essenciais presentes no DOM |
| `shows validation errors (empty)` | Zod rejeita campos vazios no submit |
| `shows validation error (bad email)` | Zod rejeita formato de e-mail inválido |
| `shows error on invalid credentials` | Mock retorna 401 → mensagem de erro exibida, `navigate` não chamado |
| `redirects to dashboard on login` | Login OK → `navigate('/dashboard')` + `authStore` atualizados |
| `toggles password visibility` | Botão de olho alterna `type` entre `password` e `text` |
| `disables button while submitting` | Estado `isPending` desabilita o botão durante a requisição |

---

## Melhorias futuras

- Gráfico de evolução de saldo (Recharts)
- Filtros no extrato por período, categoria e tipo
- PIX com validação de chave (CPF, e-mail, telefone, aleatória)
- Paginação / infinite scroll no extrato
- Dark mode (variáveis CSS já preparadas no Tailwind)
- Testes E2E com Playwright cobrindo o fluxo completo de transferência
- PWA com service worker para uso offline
