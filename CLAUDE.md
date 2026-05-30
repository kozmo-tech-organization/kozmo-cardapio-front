# Kozmo Cardápio — Contexto para Claude Code

Este arquivo é lido automaticamente pelo Claude Code ao abrir o projeto. Contém tudo que você precisa saber para trabalhar aqui sem precisar explorar o código do zero.

---

## O que é este projeto

SaaS de cardápio virtual para restaurantes. Cada restaurante tem:
- Painel admin (sidebar) para gerenciar produtos, categorias e tema visual
- Cardápio público (`/menu/:slug`) com navegação por categorias e tema customizável
- Sistema de planos (FREE / BASIC / PREMIUM) com limites de produtos e categorias

---

## Stack resumida

- **Monorepo:** pnpm workspaces + Turborepo
- **Backend:** NestJS 11 + TypeORM + PostgreSQL + oRPC (endpoint único `POST /rpc`)
- **Frontend:** React 19 + Vite + TailwindCSS v4 + TanStack Query v5
- **Validação/tipos:** Zod v3 (compartilhado entre back e front via `@repo/schemas`)
- **i18n:** contexto React próprio — pt / en / es

---

## Como iniciar o ambiente

```bash
docker compose up -d                  # PostgreSQL na porta 5432
pnpm --filter @repo/api dev           # API na porta 3001
pnpm --filter @repo/cardapio dev      # Frontend na porta 5173
```

O TypeORM cria/atualiza tabelas automaticamente (`synchronize: true` em dev). Sem migrations manuais.

---

## Onde fica cada coisa

| O que você precisa | Onde encontrar |
|---|---|
| Schemas e tipos | `packages/schemas/src/lib/*.ts` |
| Cliente HTTP tipado | `packages/server/src/orpc-client.ts` |
| Hooks React Query | `packages/queries/src/hooks/use-*.ts` |
| Páginas do admin | `packages/features/src/admin/*.tsx` |
| Cardápio público | `packages/features/src/menu/MenuPage.tsx` |
| Design system | `packages/ui/src/components/` |
| Traduções | `packages/i18n/src/lib/{admin,auth,menu,landing}/{pt,en,es}.json` |
| Entidades TypeORM | `apps/api/src/modules/*/entities/*.entity.ts` |
| Roteadores oRPC | `apps/api/src/orpc/routers/*.router.ts` |
| Serviços NestJS | `apps/api/src/modules/*/**.service.ts` |

---

## Decisões arquiteturais críticas (não quebre isso)

### 1. ESM puro no backend
`apps/api` usa `"type": "module"`. O dev runner é `tsx`, não `nest start`. Não tente usar `ts-node` ou `nest build`.

### 2. orpcClient com tipos manuais
O `orpcClient` em `packages/server` tem assinaturas explícitas baseadas nos schemas Zod. **Não importar tipos de `apps/api` no frontend** — causaria falha de resolução de módulo.

### 3. Schemas são a fonte de verdade
Todo input/output de API passa por um schema Zod em `@repo/schemas`. Alterar um campo no schema propaga automaticamente os tipos para back e front.

### 4. toPublic() nos serviços
Cada `Service` tem um método `toPublic(entity)` que serializa para o formato público. Nunca retorne a entidade TypeORM diretamente nos handlers oRPC.

### 5. Tailwind v4
O projeto usa TailwindCSS v4 (sem `tailwind.config.js`, configuração via CSS). Valores de CSS custom properties do tema são passados via `style={{ '--color-primary': ... }}` e usados com `bg-[var(--color-primary)]` ou `style={{ color: accentColor }}`.

---

## Padrão para adicionar feature nova

### Backend

1. Crie/atualize o schema em `packages/schemas/src/lib/<dominio>.ts`
2. Adicione à entidade TypeORM em `apps/api/src/modules/<dominio>/entities/`
3. Implemente a lógica em `<dominio>.service.ts` com `toPublic()`
4. Crie o handler em `apps/api/src/orpc/routers/<dominio>.router.ts`
5. Registre em `apps/api/src/orpc/router.ts`

### Frontend

1. Adicione o método no `orpcClient` em `packages/server/src/orpc-client.ts`
2. Crie o hook em `packages/queries/src/hooks/use-<dominio>.ts`
3. Exporte do `packages/queries/src/index.ts`
4. Use na page em `packages/features/src/`
5. Adicione chaves de tradução nos 3 idiomas em `packages/i18n/src/lib/`

---

## Sistema de planos — regras ativas

| Onde | Regra |
|---|---|
| `AuthService.handlePlanExpirationOnLogin` | Expira plano se `paymentDay` venceu; desativa todos produtos e categorias |
| `ProductsService.create` | Bloqueia se `count >= limitProducts` |
| `ProductsService.update` | Bloqueia ativação (`inStock false→true`) se `ativos >= limitProducts` |
| `CategoriesService.create` | Bloqueia se `count >= limitCategories` |
| `CategoriesService.update` | Bloqueia ativação (`status false→true`) se `ativas >= limitCategories` |

---

## Tabela de junção categorias ↔ produtos

A relação é M:M via `category_products`. Gerenciada pelo TypeORM com `@JoinTable`. O endpoint `categories.setProducts({ categoryId, productIds[] })` substitui a lista completa — não é incremental.

---

## Admin sidebar

O `AdminLayout` usa sidebar fixa de 240px no desktop e drawer deslizante no mobile. O `<Outlet />` fica em `lg:ml-60`. Não voltar para o padrão de navbar horizontal.

---

## Cardápio público — como o tema é aplicado

O `MenuPage` recebe `restaurant.theme` da query `useMenu` e aplica:
- Gradiente `primaryColor → accentColor` no header via `style`
- Cor do tab ativo via `style={{ backgroundColor: primaryColor }}`
- Cor do preço via `style={{ color: accentColor }}` no `ProductCard`
- `fontFamily` via `style={{ fontFamily }}` no elemento raiz

---

## O que NÃO fazer

- Não usar `nest start` ou `ts-node` para rodar a API
- Não importar de `apps/api` dentro de `packages/` ou `apps/cardapio`
- Não retornar entidades TypeORM direto dos handlers oRPC (usar `toPublic()`)
- Não adicionar lógica de negócio nos roteadores oRPC (só nos Services)
- Não criar um `tailwind.config.js` — o projeto usa Tailwind v4 sem config file
- Não adicionar `migrate:run` antes de subir em dev — `synchronize: true` faz isso
- Não esquecer de adicionar tradução nos 3 idiomas ao usar `t('chave')`

---

## Referências rápidas

- Arquitetura detalhada: `ARCHITECTURE.md`
- Contexto genérico para outras IAs: `AI_CONTEXT.md`
- Env do backend: `apps/api/.env`
- Env do frontend: `apps/cardapio/.env`
