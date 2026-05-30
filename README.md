# Kozmo Cardápio

Plataforma SaaS de cardápio virtual para restaurantes. Cada restaurante tem seu próprio painel administrativo com sidebar e um cardápio público acessível via QR Code, com suporte a categorias, temas personalizados e sistema de planos.

## Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | pnpm Workspaces + Turborepo |
| Frontend | React 19 + Vite + TypeScript |
| Estilização | TailwindCSS v4 + Radix UI |
| Backend | NestJS 11 + TypeScript |
| Banco de dados | PostgreSQL + TypeORM |
| Autenticação | JWT (Bearer token) |
| API | oRPC v1 (tipagem end-to-end) |
| Validação | Zod v3 |
| Estado assíncrono | TanStack Query v5 |
| i18n | Contexto React customizado (pt / en / es) |

---

## Requisitos

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 11+ (`npm install -g pnpm`)
- [Docker](https://docker.com) (para o PostgreSQL)

---

## Início rápido

```bash
# 1. Clone e instale as dependências
git clone <url-do-repositorio>
cd kozmo-cardapio-front
pnpm install

# 2. Suba o banco de dados
docker compose up -d

# 3. Backend (porta 3001) — abra em um terminal
pnpm --filter @repo/api dev

# 4. Frontend (porta 5173) — abra em outro terminal
pnpm --filter @repo/cardapio dev
```

> Na primeira execução, o TypeORM cria todas as tabelas automaticamente com `synchronize: true`. Nenhuma migration manual é necessária em desenvolvimento.

Acesse `http://localhost:5173` e crie sua conta de restaurante.

---

## Estrutura do projeto

```
kozmo-cardapio-front/
├── apps/
│   ├── api/                  # Backend NestJS (porta 3001)
│   └── cardapio/             # Frontend React (porta 5173)
├── packages/
│   ├── schemas/              # Schemas e tipos Zod compartilhados
│   ├── server/               # Cliente oRPC tipado (orpcClient)
│   ├── queries/              # Hooks TanStack Query
│   ├── features/             # Páginas e componentes por feature
│   ├── ui/                   # Design system (Button, Card, Badge...)
│   └── i18n/                 # Traduções pt/en/es + hook useTranslation
├── ARCHITECTURE.md           # Decisões técnicas e diagramas
├── AI_CONTEXT.md             # Contexto para assistentes de IA
├── CLAUDE.md                 # Instruções para o Claude Code
├── docker-compose.yml
└── turbo.json
```

### `apps/api` — Backend NestJS

```
src/
├── main.ts                   # Bootstrap Express + oRPC middleware
├── app.module.ts             # Módulo raiz (importa todos os módulos)
├── config/
│   ├── database.config.ts    # Configuração TypeORM via env
│   └── data-source.ts        # DataSource para CLI de migrations
├── modules/
│   ├── auth/                 # Login, registro, expiração de plano
│   ├── restaurants/          # CRUD + tema + slug
│   ├── products/             # CRUD + limite por plano
│   ├── categories/           # CRUD + limite por plano + relação M:M produtos
│   └── reviews/              # Avaliações públicas de produtos
└── orpc/
    ├── context.ts            # Extrai restaurant do JWT por request
    ├── middleware.ts          # publicProcedure / protectedProcedure
    ├── router.ts             # Roteador principal (compõe todos)
    └── routers/              # Um arquivo por domínio
```

### `apps/cardapio` — Frontend React

```
src/
├── main.tsx                  # Bootstrap (QueryClient + AuthProvider + App)
├── App.tsx                   # Definição de rotas (react-router)
└── index.css                 # Variáveis CSS globais / tokens Tailwind
```

### `packages/`

| Package | Responsabilidade |
|---|---|
| `@repo/schemas` | Schemas Zod + tipos TypeScript usados no backend e frontend |
| `@repo/server` | `orpcClient` — cliente HTTP tipado; gerencia `authToken` em memória |
| `@repo/queries` | Hooks React Query: `useLogin`, `useProducts`, `useCategories`, `useMenu`... |
| `@repo/features` | Páginas completas: auth, admin (sidebar + rotas), menu público |
| `@repo/ui` | Componentes reutilizáveis: `Button`, `Input`, `Card`, `Badge`, `Spinner`, `FormField` |
| `@repo/i18n` | `I18nProvider`, `useTranslation`, JSONs de tradução por idioma |

---

## Variáveis de ambiente

### Backend (`apps/api/.env`)

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=kozmo_cardapio

JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

### Frontend (`apps/cardapio/.env`)

```env
VITE_API_URL=http://localhost:3001
```

---

## Rotas da aplicação

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Landing page | Público |
| `/register` | Cadastro de novo restaurante | Público |
| `/login` | Login do restaurante | Público |
| `/menu/:slug` | Cardápio público para clientes | Público |
| `/admin` | Dashboard do painel admin | Autenticado |
| `/admin/products` | Gestão de produtos | Autenticado |
| `/admin/categories` | Gestão de categorias | Autenticado |
| `/admin/visualizar` | Preview do cardápio (iframe) | Autenticado |
| `/admin/settings` | Configurações e tema do restaurante | Autenticado |

---

## API — Procedimentos oRPC

Todos os procedimentos são acessados via `POST http://localhost:3001/rpc`.

### Auth (público)

| Procedimento | Input | Output |
|---|---|---|
| `auth.login` | `{ email, password }` | `{ accessToken, restaurant }` |
| `auth.register` | `{ name, email, password }` | `{ accessToken, restaurant }` |

### Restaurante (autenticado)

| Procedimento | Input | Output |
|---|---|---|
| `restaurant.me` | — | `Restaurant` |
| `restaurant.update` | `{ name?, theme?, logoUrl?, bannerUrl?, whatsappPhone? }` | `Restaurant` |

### Produtos (autenticado)

| Procedimento | Input | Output |
|---|---|---|
| `products.list` | `{ search?, inStock?, minPrice?, maxPrice? }?` | `Product[]` |
| `products.create` | `{ name, price, preparationTimeMinutes, description, inStock }` | `Product` |
| `products.update` | `{ id, ...campos opcionais }` | `Product` |
| `products.delete` | `{ id }` | `{ success: true }` |

### Categorias (autenticado)

| Procedimento | Input | Output |
|---|---|---|
| `categories.list` | — | `Category[]` |
| `categories.create` | `{ title, subtitle?, imageUrl?, order?, status? }` | `Category` |
| `categories.update` | `{ id, ...campos opcionais }` | `Category` |
| `categories.delete` | `{ id }` | `{ success: true }` |
| `categories.setProducts` | `{ categoryId, productIds[] }` | `Category` |

### Cardápio público (público)

| Procedimento | Input | Output |
|---|---|---|
| `menu.getBySlug` | `{ slug }` | `{ restaurant, categories[], products[], uncategorizedProducts[] }` |

> Retorna apenas produtos com `inStock: true` e categorias com `status: true`.

### Avaliações (público)

| Procedimento | Input | Output |
|---|---|---|
| `reviews.create` | `{ productId, clientName, comment, rating }` | `Review` |
| `reviews.listByProduct` | `{ productId }` | `Review[]` |

---

## Banco de dados

### Entidades (TypeORM)

```
restaurants       — id, email, passwordHash, name, slug, theme (JSONB),
                    logoUrl, bannerUrl, whatsappPhone, status, planType,
                    limitProducts, limitCategories, paymentDay

products          — id, restaurantId (FK), name, price, preparationTimeMinutes,
                    description, imageUrl, inStock

categories        — id, restaurantId (FK), title, subtitle, imageUrl, order, status

category_products — categoryId (FK), productId (FK)   [tabela de junção M:M]

reviews           — id, productId (FK), clientName, comment, rating
```

> **Desenvolvimento:** `synchronize: true` — as tabelas são criadas/alteradas automaticamente ao iniciar a API.
>
> **Produção:** desabilite `synchronize` e use `pnpm --filter @repo/api migration:generate`.

---

## Sistema de planos

Cada restaurante tem um `planType` (`FREE` | `BASIC` | `PREMIUM`) com limites numéricos:

| Campo | Descrição |
|---|---|
| `limitProducts` | Máximo de produtos ativos (`inStock: true`) |
| `limitCategories` | Máximo de categorias ativas (`status: true`) |
| `paymentDay` | Data de expiração do plano |

### Regras aplicadas

- **No login:** se `planType !== 'FREE'` e `paymentDay` expirou → reseta para FREE, desativa todos os produtos e categorias do restaurante.
- **Ao criar produto:** conta produtos existentes; bloqueia se atingir `limitProducts`.
- **Ao ativar produto** (`inStock: false → true`): conta ativos; bloqueia se atingir `limitProducts`.
- **Ao criar categoria:** conta categorias existentes; bloqueia se atingir `limitCategories`.
- **Ao ativar categoria** (`status: false → true`): conta ativas; bloqueia se atingir `limitCategories`.

---

## Regras de negócio

- Cada restaurante acessa o sistema com e-mail e senha (JWT salvo em `localStorage`).
- O slug é gerado automaticamente do nome (ex: `pizzaria-do-joao`); garantido único.
- Produtos com `inStock: false` **não aparecem** no cardápio público.
- Categorias com `status: false` **não aparecem** no cardápio público.
- O cardápio público aplica as cores do tema (`primaryColor`, `accentColor`) configuradas pelo restaurante.
- Clientes podem avaliar produtos com nome, comentário e nota de 1–5 estrelas.
- O cardápio suporta três idiomas: Português, English, Español (salvo em `localStorage`).

---

## QR Code

O link do cardápio segue o padrão:

```
http://seu-dominio.com/menu/{slug}
```

O slug aparece no dashboard do painel admin. Gere um QR Code apontando para esse link e disponibilize nas mesas.

---

## Comandos úteis

```bash
# Instalar dependências (todos os workspaces)
pnpm install

# Subir banco de dados
docker compose up -d

# Backend em dev (porta 3001)
pnpm --filter @repo/api dev

# Frontend em dev (porta 5173)
pnpm --filter @repo/cardapio dev

# Build do frontend
pnpm --filter @repo/cardapio build

# Parar banco de dados
docker compose down
```

---

## Adicionando um novo procedimento oRPC

1. **Schema** em `packages/schemas/src/lib/<dominio>.ts`:

```typescript
export const NovaEntidadeSchema = z.object({ ... })
export type NovaEntidade = z.infer<typeof NovaEntidadeSchema>
```

2. **Cliente** em `packages/server/src/orpc-client.ts`:

```typescript
novoModulo: {
  fazAlgo: (input: NovaEntidadeInput): Promise<NovaEntidade> =>
    rpc.novoModulo.fazAlgo(input),
}
```

3. **Hook** em `packages/queries/src/hooks/use-novo-modulo.ts`:

```typescript
export function useFazAlgo() {
  return useMutation({
    mutationFn: (input: NovaEntidadeInput) => orpcClient.novoModulo.fazAlgo(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['novo-modulo'] }),
  })
}
```

4. **Roteador** em `apps/api/src/orpc/routers/novo-modulo.router.ts`:

```typescript
export function createNovoModuloRouter(service: NovoModuloService) {
  return {
    fazAlgo: protectedProcedure
      .input(NovaEntidadeSchema)
      .handler(async ({ input, context }) => service.fazAlgo(context.restaurant.id, input)),
  }
}
```

5. **Registre** em `apps/api/src/orpc/router.ts` e exporte do `packages/queries/src/index.ts`.
