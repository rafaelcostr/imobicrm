# Syntra Imóveis

Produto imobiliário da plataforma **Syntra CRM**, desenvolvido pela **Syntra**.

Organiza todo o fluxo comercial imobiliário: da captação do lead até o fechamento da venda. O gestor acompanha a equipe e os indicadores; o corretor trabalha leads, visitas e propostas no dia a dia; o administrador controla usuários, permissões e configurações.

## Estrutura da marca

| Nível | Nome |
|-------|------|
| Empresa | **Syntra** |
| Plataforma | **Syntra CRM** |
| Produto (este repo) | **Syntra Imóveis** |
| Em breve | Syntra Med · Syntra Sales · Syntra Legal |

## Stack

- **Frontend:** Next.js 15, React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend:** Next.js Server Actions, Prisma ORM
- **Banco:** PostgreSQL
- **Auth:** NextAuth/Auth.js

## Instalação

```bash
cd imobicrm   # pasta do projeto (renomeie quando quiser)
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Acesse: http://localhost:3000

## Credenciais (seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Super Admin | super@syntra.app | Syntra@2026 |
| Admin (Alpha) | admin@syntra.app | Syntra@2026 |
| Gestor | gestor@syntra.app | Syntra@2026 |
| Corretor | joao@syntra.app | Syntra@2026 |
| Admin (Beta) | admin@beta-imoveis.com | Syntra@2026 |

## Rotas públicas

| Rota | Descrição |
|------|-----------|
| `/` | Landing SaaS ou home da imobiliária (tenant) |
| `/vitrine` | Imóveis publicados (SEO) |
| `/captura` | Formulário de leads |
| `/login` | Área do corretor/gestor |
| `/cadastro` | Trial de nova imobiliária |
