# Kozmo Cardápio

Plataforma SaaS de cardápio virtual para restaurantes. Cada restaurante tem seu próprio painel administrativo e um cardápio público acessível via QR Code.

## Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | pnpm Workspaces + Turborepo |
| Frontend | React 19 + Vite + TypeScript |
| Estilização | TailwindCSS v4 + Radix UI |
| Backend | NestJS 11 + TypeScript |
| Banco de dados | PostgreSQL + TypeORM |
| Autenticação | JWT (Bearer token) |
| API | oRPC (tipagem end-to-end) |
| Validação | Zod |
| Estado assíncrono | TanStack Query v5 |

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
docker-compose up -d

# 3. Backend (porta 3001) — abre em um terminal
pnpm --filter @repo/api dev

# 4. Frontend (porta 5173) — abre em outro terminal
pnpm --filter @repo/cardapio dev
```

> Na primeira execução, o TypeORM cria todas as tabelas automaticamente. Nenhuma migration manual é necessária.

Acesse `http://localhost:5173` e crie sua conta de restaurante.

---

## Estrutura do projeto

```
kozmo-cardapio-front/
├── apps/
│   ├── api/                  # Backend NestJS
│   └── cardapio/             # Frontend React
├── packages/
│   ├── schemas/              # Schemas Zod compartilhados
│   ├── server/               # Cliente oRPC tipado
│   ├── queries/              # Hooks TanStack Query
│   ├── features/             # Páginas e componentes por feature
│   └── ui/                   # Design system
├── docker-compose.yml
└── turbo.json
```

### `apps/api` — Backend

```
src/
├── main.ts                   # Bootstrap + oRPC middleware
├── app.module.ts             # Módulo raiz
├── config/
│   ├── database.config.ts    # Configuração TypeORM
│   └── data-source.ts        # DataSource para migrations
├── modules/
│   ├── auth/                 # Autenticação JWT
│   ├── restaurants/          # Gestão de restaurantes
│   ├── products/             # Gestão de produtos
│   └── reviews/              # Avaliações dos clientes
└── orpc/
    ├── context.ts            # Contexto por request (JWT)
    ├── middleware.ts          # publicProcedure / protectedProcedure
    ├── router.ts             # Roteador principal
    └── routers/              # Roteadores por domínio
```

### `apps/cardapio` — Frontend

```
src/
├── main.tsx                  # Bootstrap + providers
├── App.tsx                   # Definição de rotas
└── index.css                 # Variáveis CSS / tokens
```

### `packages/`

| Package | Responsabilidade |
|---|---|
| `@repo/schemas` | Tipos e validações Zod usados em todo o projeto |
| `@repo/server` | `orpcClient` — cliente HTTP tipado para o backend |
| `@repo/queries` | Hooks React Query (`useLogin`, `useProducts`, `useMenu`...) |
| `@repo/features` | Páginas completas: auth, admin, menu público |
| `@repo/ui` | Componentes reutilizáveis: Button, Input, Card, Badge... |

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
| `/register` | Cadastro de novo restaurante | Público |
| `/login` | Login do restaurante | Público |
| `/admin` | Dashboard do painel admin | Autenticado |
| `/admin/products` | Gestão de produtos | Autenticado |
| `/admin/settings` | Configurações do restaurante | Autenticado |
| `/menu/:slug` | Cardápio público para clientes | Público |

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
| `restaurant.update` | `{ name?, theme?, logoUrl?, bannerUrl? }` | `Restaurant` |

### Produtos (autenticado)

| Procedimento | Input | Output |
|---|---|---|
| `products.list` | `{ search?, inStock?, minPrice?, maxPrice? }?` | `Product[]` |
| `products.create` | `{ name, price, preparationTimeMinutes, description, inStock }` | `Product` |
| `products.update` | `{ id, ...campos opcionais }` | `Product` |
| `products.delete` | `{ id }` | `{ success: true }` |

### Cardápio (público)

| Procedimento | Input | Output |
|---|---|---|
| `menu.getBySlug` | `{ slug }` | `{ restaurant, products[] }` com avaliações |

### Avaliações (público)

| Procedimento | Input | Output |
|---|---|---|
| `reviews.create` | `{ productId, clientName, comment, rating }` | `Review` |
| `reviews.listByProduct` | `{ productId }` | `Review[]` |

---

## Banco de dados

### Tabelas criadas automaticamente

```
restaurants   — id, email, passwordHash, name, slug, theme (JSONB), logoUrl, bannerUrl
products      — id, restaurantId, name, price, preparationTimeMinutes, description, imageUrl, inStock
reviews       — id, productId, clientName, comment, rating
```

> **Desenvolvimento:** `synchronize: true` no TypeORM — as tabelas são criadas/atualizadas automaticamente ao iniciar a API.
>
> **Produção:** desabilite `synchronize` e use migrations geradas com `pnpm --filter @repo/api migration:generate`.

---

## Regras de negócio

- Cada restaurante acessa o sistema com e-mail e senha
- O slug do restaurante é gerado automaticamente a partir do nome (ex: `pizzaria-do-joao`)
- Produtos com `inStock: false` **não aparecem** no cardápio público
- Clientes podem avaliar produtos informando nome, comentário e nota (1–5 estrelas)
- As avaliações ficam visíveis para todos os clientes do cardápio

---

## QR Code

O link do cardápio de cada restaurante segue o padrão:

```
http://seu-dominio.com/menu/{slug}
```

O slug aparece no dashboard do painel admin. Basta gerar um QR Code apontando para esse link e disponibilizá-lo nas mesas.

---

## Desenvolvimento — comandos úteis

```bash
# Instalar dependências de todos os packages
pnpm install

# Rodar tudo em modo dev (backend + frontend)
pnpm dev

# Rodar apenas o backend
pnpm --filter @repo/api dev

# Rodar apenas o frontend
pnpm --filter @repo/cardapio dev

# Build do frontend
pnpm --filter @repo/cardapio build

# Subir o banco de dados
docker-compose up -d

# Parar o banco de dados
docker-compose down
```

---

## Adicionando um novo procedimento oRPC

1. **Adicione o schema** em `packages/schemas/src/lib/`:

```typescript
// packages/schemas/src/lib/product.ts
export const NewFeatureSchema = z.object({ ... })
```

2. **Adicione o método no cliente** em `packages/server/src/orpc-client.ts`:

```typescript
newFeature: {
  doSomething: (input: NewFeatureInput): Promise<NewFeatureOutput> =>
    rpc.newFeature.doSomething(input),
}
```

3. **Crie o hook** em `packages/queries/src/hooks/`:

```typescript
export function useDoSomething() {
  return useMutation({
    mutationFn: (input: NewFeatureInput) => orpcClient.newFeature.doSomething(input),
  })
}
```

4. **Implemente o roteador** em `apps/api/src/orpc/routers/`:

```typescript
export function createNewFeatureRouter(service: NewFeatureService) {
  return {
    doSomething: publicProcedure
      .input(NewFeatureSchema)
      .handler(async ({ input }) => service.doSomething(input)),
  }
}
```

5. **Registre no router principal** em `apps/api/src/orpc/router.ts`.
