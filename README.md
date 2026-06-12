# ImobiCRM

CRM imobiliário SaaS completo para corretores e imobiliárias.

## Stack

- **Frontend:** Next.js 15, React, TypeScript, TailwindCSS, Shadcn/UI, Lucide Icons
- **Backend:** Next.js Server Actions, Prisma ORM
- **Banco:** PostgreSQL
- **Auth:** NextAuth/Auth.js (e-mail e senha + recuperação)

## Módulos

| Módulo | Rota |
|--------|------|
| Dashboard | `/dashboard` |
| Leads | `/leads` |
| Funil Kanban | `/funil` |
| Imóveis | `/imoveis` |
| Área do Corretor | `/corretor` |
| Comissões | `/comissoes` |
| Agenda | `/agenda` |
| WhatsApp | `/whatsapp` |
| Relatórios | `/relatorios` |
| Captação pública | `/captura` |

## Perfis de usuário

- **Administrador** — acesso total
- **Gestor** — gestão de equipe, leads, imóveis e relatórios
- **Corretor** — leads próprios, funil, agenda e comissões

## Instalação

```bash
cd imobicrm
cp .env.example .env
# Configure DATABASE_URL e AUTH_SECRET no .env

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Acesse: http://localhost:3000

## Credenciais (seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@imobicrm.com | Imobi@2026 |
| Gestor | gestor@imobicrm.com | Imobi@2026 |
| Corretor | joao@imobicrm.com | Imobi@2026 |

## Estrutura de pastas

```
src/
├── actions/          # Server Actions por domínio
├── app/              # Rotas (App Router)
├── components/
│   ├── layout/       # Sidebar, header, shell
│   ├── modules/      # Componentes por módulo
│   └── ui/           # Shadcn/UI
├── lib/              # Auth, Prisma, permissões, utils
└── types/
```

## Segurança

Consulte [SECURITY.md](./SECURITY.md) para detalhes de pentest, headers, LGPD e boas práticas.

## Autor

Desenvolvido por [rafaelcostr](https://github.com/rafaelcostr).
