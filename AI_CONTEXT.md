# Contexto do Projeto para Assistentes de IA

Este documento é um briefing completo do projeto Kozmo Cardápio para assistentes de IA (Cursor, Copilot, ChatGPT, Gemini, Claude, etc.). Leia inteiro antes de sugerir mudanças.

---

## O que é o projeto

**Kozmo Cardápio** é um SaaS multi-tenant de cardápio virtual para restaurantes. Cada restaurante:
- Cria uma conta com e-mail e senha
- Gerencia produtos, categorias e tema visual via painel admin
- Tem um cardápio público acessível por URL e QR Code
- Está sujeito a limites de plano (FREE / BASIC / PREMIUM)

---

## Stack técnica

```
Monorepo:    pnpm workspaces + Turborepo
Backend:     NestJS 11 + TypeORM + PostgreSQL
API:         oRPC v1 (endpoint único POST /rpc — não é REST)
Frontend:    React 19 + Vite + TailwindCSS v4
Estado:      TanStack Query v5 (sem Redux/Zustand)
Tipos/valid: Zod v3 (compartilhado back↔front)
Auth:        JWT (Bearer, salvo em localStorage)
i18n:        Próprio (pt / en / es, JSON por domínio)
```

**Portas de desenvolvimento:** API = 3001, Frontend = 5173

---

## Estrutura de diretórios

```
apps/
  api/          NestJS — src/modules/ + src/orpc/
  cardapio/     React — src/App.tsx (rotas) + src/main.tsx (bootstrap)

packages/
  schemas/      Zod schemas + tipos TypeScript (fonte de verdade dos tipos)
  server/       orpcClient — cliente HTTP tipado (sem dependências do NestJS)
  queries/      Hooks TanStack Query que chamam orpcClient
  features/     Páginas React (admin/, menu/, auth/, landing/)
  ui/           Design system (Button, Input, Card, Badge, Spinner, FormField)
  i18n/         I18nProvider + useTranslation + JSONs pt/en/es
```

---

## Banco de dados — entidades principais

### `restaurants`
```
id uuid PK
email varchar UNIQUE
passwordHash varchar
name varchar
slug varchar UNIQUE          -- gerado do nome, ex: "pizzaria-do-joao"
theme jsonb                  -- { primaryColor, secondaryColor, accentColor, fontFamily }
logoUrl text nullable
bannerUrl text nullable
whatsappPhone varchar nullable
status boolean default false
planType enum('FREE','BASIC','PREMIUM') default 'FREE'
limitProducts numeric default 1
limitCategories numeric default 1
paymentDay date nullable
```

### `products`
```
id uuid PK
restaurantId uuid FK(restaurants)
name varchar
price decimal(10,2)
preparationTimeMinutes int
description text
imageUrl text nullable
inStock boolean default true
```

### `categories`
```
id uuid PK
restaurantId uuid FK(restaurants)
title varchar
subtitle text nullable
imageUrl text nullable
order int default 0
status boolean default false    -- false = inativa (não aparece no cardápio público)
```

### `category_products` (tabela de junção M:M)
```
categoryId uuid FK(categories)
productId uuid FK(products)
```

### `reviews`
```
id uuid PK
productId uuid FK(products)
clientName varchar
comment text
rating int (1–5)
```

---

## API — todos os procedimentos oRPC

Endpoint: `POST http://localhost:3001/rpc`
Headers: `Authorization: Bearer <token>` (quando autenticado)

### Públicos (sem token)
```
auth.login({ email, password })                    → { accessToken, restaurant }
auth.register({ name, email, password })           → { accessToken, restaurant }
menu.getBySlug({ slug })                           → Menu
reviews.create({ productId, clientName, comment, rating }) → Review
reviews.listByProduct({ productId })               → Review[]
```

### Autenticados (token obrigatório)
```
restaurant.me()                                    → Restaurant
restaurant.update({ name?, theme?, logoUrl?, bannerUrl?, whatsappPhone? }) → Restaurant

products.list({ search?, inStock?, minPrice?, maxPrice? }?) → Product[]
products.create({ name, price, preparationTimeMinutes, description, imageUrl?, inStock? }) → Product
products.update({ id, ...campos opcionais })       → Product
products.delete({ id })                            → { success: true }

categories.list()                                  → Category[]
categories.create({ title, subtitle?, imageUrl?, order?, status? }) → Category
categories.update({ id, ...campos opcionais })     → Category
categories.delete({ id })                          → { success: true }
categories.setProducts({ categoryId, productIds[] }) → Category
```

---

## Tipos principais (inferidos dos schemas Zod)

```typescript
// Restaurant
{ id, email, name, slug, theme, logoUrl, bannerUrl, whatsappPhone, createdAt, updatedAt }

// Theme
{ primaryColor: string, secondaryColor: string, accentColor: string, fontFamily: string }

// Product
{ id, restaurantId, name, price, preparationTimeMinutes, description, imageUrl, inStock, createdAt, updatedAt }

// Category
{ id, restaurantId, title, subtitle, imageUrl, order, status, productIds[], createdAt, updatedAt }

// Menu (retorno do cardápio público)
{
  restaurant: Restaurant,
  categories: MenuCategory[],       // só status: true
  products: MenuProduct[],          // só inStock: true, todos
  uncategorizedProducts: MenuProduct[]  // produtos não em categoria ativa
}

// MenuCategory
{ id, title, subtitle, imageUrl, order, products: MenuProduct[] }

// MenuProduct
{ ...Product, reviews: Review[], averageRating: number | null }
```

---

## Regras de negócio importantes

### Sistema de planos
1. **No login:** se plano ≠ FREE e `paymentDay` expirou → volta para FREE, `limitProducts = 1`, `limitCategories = 1`, todos os produtos ficam `inStock: false`, todas categorias ficam `status: false`
2. **Criar produto:** bloqueia com `ForbiddenException` se `count(produtos) >= limitProducts`
3. **Ativar produto** (`inStock false→true`): bloqueia se `count(produtos inStock: true) >= limitProducts`
4. **Criar categoria:** bloqueia com `ForbiddenException` se `count(categorias) >= limitCategories`
5. **Ativar categoria** (`status false→true`): bloqueia se `count(categorias status: true) >= limitCategories`

### Cardápio público
- Só produtos com `inStock: true` aparecem
- Só categorias com `status: true` aparecem
- Produto cujas categorias estão todas inativas → aparece em `uncategorizedProducts`
- As cores do tema do restaurante são aplicadas via CSS inline no frontend

### Slug
- Gerado automaticamente do nome: lowercase + sem acentos + espaços→hífens
- Garantido único (sufixo timestamp se necessário)

---

## Decisões técnicas que NÃO devem ser mudadas

| Decisão | Motivo |
|---|---|
| `"type": "module"` na API + `tsx` como runner | `@orpc/server` é pure ESM; `tsx` suporta `emitDecoratorMetadata` |
| `orpcClient` com tipos manuais (sem `RouterClient<AppRouter>`) | Importar tipos do NestJS no frontend quebraria resolução de módulo |
| `toPublic()` em cada Service | Garante que campos internos (ex: passwordHash) nunca vazem |
| Sem Redux/Zustand | TanStack Query gerencia todo estado de servidor; bastante para este app |
| Tailwind v4 sem `tailwind.config.js` | Configuração via CSS nativo — não crie o arquivo de config |

---

## Padrão de código esperado

### Backend — novo procedimento
```typescript
// 1. Schema (packages/schemas/src/lib/dominio.ts)
export const CriarXSchema = z.object({ campo: z.string().min(2) })
export type CriarXInput = z.infer<typeof CriarXSchema>

// 2. Service (apps/api/src/modules/dominio/dominio.service.ts)
async create(restaurantId: string, input: CriarXInput) {
  const entity = this.repo.create({ ...input, restaurantId })
  return this.repo.save(entity)
}
toPublic(entity: X) { return { id: entity.id, ... } }

// 3. Router (apps/api/src/orpc/routers/dominio.router.ts)
createX: protectedProcedure
  .input(CriarXSchema)
  .handler(async ({ input, context }) =>
    service.toPublic(await service.create(context.restaurant.id, input))
  )
```

### Frontend — novo hook
```typescript
// packages/queries/src/hooks/use-dominio.ts
export function useCriarX() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CriarXInput) => orpcClient.dominio.criarX(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dominio'] }),
  })
}
```

---

## Componentes UI disponíveis

Do `@repo/ui`:
```
Button     — variantes: default | outline | destructive | ghost; props: loading, size
Input      — input HTML estilizado
Label      — label HTML estilizado
FormField  — Label + Input agrupados
Card       — container com borda arredondada
CardHeader, CardTitle, CardDescription, CardContent
Badge      — variantes: default | success | destructive | outline
Spinner    — indicador de carregamento; prop: size (sm | md | lg)
```

---

## i18n — como adicionar texto novo

1. Abra `packages/i18n/src/lib/{admin|auth|menu|landing}/pt.json`
2. Adicione a chave com valor em português
3. Adicione o mesmo em `en.json` e `es.json`
4. No componente: `const { t } = useTranslation()` → `t('sua.chave')`
5. Com variáveis: `t('menu.results.other', { count: 5, query: 'pizza' })` → string usa `{count}` e `{query}`

---

## Rotas do frontend

```
/                     LandingPage (público)
/login                LoginPage (público)
/register             RegisterPage (público)
/menu/:slug           MenuPage (público — cardápio do restaurante)

/admin                DashboardPage (autenticado)
/admin/products       ProductsPage
/admin/categories     CategoriesPage
/admin/visualizar     ViewMenuPage (iframe do cardápio)
/admin/settings       RestaurantSettingsPage
```

`ProtectedRoute` em `packages/features/src/shared/ProtectedRoute.tsx` redireciona para `/login` se não houver token.
