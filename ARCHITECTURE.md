# Arquitetura — Kozmo Cardápio

Documento de referência técnica para desenvolvedores. Explica as decisões de design, o fluxo de dados e as convenções do projeto.

---

## Visão geral

O Kozmo é um monorepo pnpm com dois apps e cinco packages compartilhados. A API usa NestJS com oRPC em vez de REST/GraphQL. O frontend é React 19 com TanStack Query. Tudo é tipado de ponta a ponta via Zod.

```
Browser → React (Vite) → orpcClient (fetch) → NestJS + oRPC → PostgreSQL
```

---

## Decisão crítica: ESM + tsx no NestJS

**Problema:** `@orpc/server` v1 é pure ESM. NestJS é historicamente CJS.

**Solução aplicada:**
- `apps/api/package.json` tem `"type": "module"` (força ESM em todo o app)
- `apps/api/tsconfig.json` usa `"module": "ESNext"` + `"moduleResolution": "Bundler"`
- O runtime é `tsx` (não `nest start`), que transpila on-the-fly e suporta `emitDecoratorMetadata`

**Por que isso importa:**
- `nest start` e `ts-node` não funcionam com esta config
- Sempre usar `tsx watch src/main.ts` para dev e `tsx src/main.ts` para produção
- Imports relativos precisam de extensão `.js` se a transpilação emitir arquivos — mas com `tsx` isso não se aplica

---

## Fluxo de autenticação

```
1. LoginPage → orpcClient.auth.login(email, password)
2. API: valida bcrypt, verifica expiração de plano, retorna JWT
3. Frontend: salva token em localStorage('access_token')
4. setAuthToken(token) → atualiza o header Authorization do orpcClient
5. ProtectedRoute: verifica token + restaurante no contexto
6. Logout: limpa localStorage + setAuthToken(null) + navega para /login
```

O `orpcClient` em `packages/server/src/orpc-client.ts` mantém `authToken` em módulo (variável de módulo ESM). Toda requisição lê esse valor via `headers: () => getAuthHeaders(authToken)`.

---

## oRPC — como funciona

oRPC é uma camada RPC tipada que monta um único endpoint HTTP `POST /rpc`. O nome do procedimento vai no corpo da requisição.

### Estrutura de um procedimento

```typescript
// protectedProcedure: middleware que extrai context.restaurant do JWT
export const protectedProcedure = base.use(({ context, next }) => {
  if (!context.restaurant) throw new ORPCError('UNAUTHORIZED', ...)
  return next({ context: { ...context, restaurant: context.restaurant } })
})

// Uso num roteador:
fazAlgo: protectedProcedure
  .input(FazAlgoSchema)          // valida input com Zod
  .handler(async ({ input, context }) => {
    return service.fazAlgo(context.restaurant.id, input)
  })
```

### Por que não usar `RouterClient<AppRouter>`

O tipo `AppRouter` é inferido de `createAppRouter()` no servidor. Importar esse tipo no frontend puxaria todas as dependências do NestJS (decorators, reflect-metadata, etc.) para o bundle do Vite.

**Solução:** o `orpcClient` em `packages/server` tem assinaturas manuais baseadas nos schemas Zod, sem importar nada do server.

---

## Fluxo de dados — cardápio público

```
MenuPage (/menu/:slug)
  → useMenu(slug) [TanStack Query]
    → orpcClient.menu.getBySlug({ slug })
      → menu.router.ts
        → restaurantsService.findBySlug(slug)
        → productsService.findByRestaurant(id, { inStock: true })
        → categoriesService.findByRestaurant(id)  [filtra status: true]
        → reviewsService.findByProduct(productId) [para cada produto]
        → monta: { restaurant, categories[], products[], uncategorizedProducts[] }
```

**Nota sobre uncategorized:** um produto é "não categorizado" se não pertence a nenhuma categoria **ativa**. Produtos de categorias inativas reaparecem como uncategorized.

---

## Sistema de planos

### Entidade `Restaurant` (campos relevantes)

```typescript
planType: 'FREE' | 'BASIC' | 'PREMIUM'  // default FREE
limitProducts: number                     // default 1
limitCategories: number                   // default 1
paymentDay: Date | null                   // data de expiração
```

### Regras de negócio (onde são aplicadas)

| Regra | Onde | Condição |
|---|---|---|
| Expirar plano no login | `AuthService.handlePlanExpirationOnLogin` | `planType !== FREE && today > paymentDay` |
| Bloquear criação de produto | `ProductsService.create` | `count >= limitProducts` |
| Bloquear ativação de produto | `ProductsService.update` | `inStock false→true && ativos >= limitProducts` |
| Bloquear criação de categoria | `CategoriesService.create` | `count >= limitCategories` |
| Bloquear ativação de categoria | `CategoriesService.update` | `status false→true && ativas >= limitCategories` |

Quando o plano expira: `limitProducts = 1`, `limitCategories = 1`, `planType = FREE`, `paymentDay = null`, todos os produtos ficam `inStock: false`, todas as categorias ficam `status: false`.

---

## Relação Categoria ↔ Produto (M:M)

```
categories ←→ category_products ←→ products
```

- A tabela de junção é `category_products` (gerenciada pelo TypeORM com `@JoinTable`)
- Um produto pode aparecer em múltiplas categorias
- No cardápio público, um produto aparece em cada categoria que pertence
- Um produto SEM nenhuma categoria ativa aparece em `uncategorizedProducts`
- A gestão de produtos de uma categoria é feita via `categories.setProducts({ categoryId, productIds[] })`

---

## Tema visual (Restaurant.theme)

O tema é um objeto JSONB na tabela `restaurants`:

```typescript
theme: {
  primaryColor: string    // cor principal (ex: '#c0392b')
  secondaryColor: string  // cor secundária (ex: '#ffffff')
  accentColor: string     // cor de destaque (ex: '#ff6b35')
  fontFamily: string      // fonte (ex: 'Inter')
}
```

No cardápio público (`MenuPage`), o tema é aplicado via:
- `style={{ fontFamily }}` no elemento raiz
- `style={{ background: gradient(primaryColor, accentColor) }}` no header
- `style={{ backgroundColor: primaryColor }}` no tab ativo de categoria
- `style={{ color: accentColor }}` no preço de cada produto

---

## Internacionalização (i18n)

- Implementação própria, sem biblioteca externa
- Idiomas: `pt` (padrão), `en`, `es`
- Arquivos JSON em `packages/i18n/src/lib/{admin,auth,menu,landing}/{pt,en,es}.json`
- Carregados em `I18nContext` e mesclados em um único dicionário por idioma
- Interpolação via `{variavel}` nas strings: `t('key', { count: 3 })`
- Idioma salvo em `localStorage('kozmo-lang')`

### Adicionando uma chave nova

1. Adicione a chave em `pt.json`, `en.json` e `es.json` do domínio correto
2. Use com `const { t } = useTranslation()` e `t('sua.chave')`

---

## Admin — Layout sidebar

O painel administrativo usa um layout de sidebar fixa:

```
┌─────────────┬──────────────────────────────┐
│  Sidebar    │                              │
│  (240px)    │        <Outlet />            │
│  fixed      │      (conteúdo da rota)      │
│             │                              │
└─────────────┴──────────────────────────────┘
```

- Desktop: sidebar fixa à esquerda com `lg:ml-60` no conteúdo principal
- Mobile: hambúrguer abre drawer deslizante + overlay escuro
- A sidebar contém: logo, links de nav, seletor de idioma, info do restaurante, botão sair

---

## Packages — convenções de export

Cada package tem um `src/index.ts` que re-exporta tudo:

```typescript
// packages/queries/src/index.ts
export { orpcClient } from './client'
export * from './hooks/use-auth'
export * from './hooks/use-products'
// ...
```

Imports no frontend sempre vêm do package: `import { useProducts } from '@repo/queries'`

---

## Paths do TypeScript

O workspace usa paths TS em cada `tsconfig.json` e `vite.config.ts` para resolver packages do monorepo:

```json
// apps/api/tsconfig.json
"paths": {
  "@repo/schemas": ["../../packages/schemas/src/index.ts"]
}
```

O pnpm resolve os outros packages via symlinks no `node_modules/.pnpm`.

---

## Padrão de serviços NestJS

Cada módulo segue:

```
modules/{dominio}/
├── {dominio}.module.ts     # imports: TypeOrmModule.forFeature([...entities])
├── {dominio}.service.ts    # lógica de negócio + toPublic()
└── entities/
    └── {dominio}.entity.ts # @Entity com decorators TypeORM
```

O método `toPublic(entity)` serializa a entidade para o formato exposto pela API, garantindo que campos internos (como `passwordHash`) nunca vazem.

---

## Índices do banco de dados

```typescript
@Index('IDX_PROD_REST_UUID', ['restaurantId'])  // products
@Index('IDX_CATEG_REST_UUI', ['restaurantId'])  // categories
```

Consultas por `restaurantId` (o caso mais comum) são O(log n).
