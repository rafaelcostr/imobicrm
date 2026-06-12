# ImobiCRM

Plataforma de gestão comercial para o mercado imobiliário. Centraliza leads, funil de vendas, carteira de imóveis, agenda, comissões e relatórios em um único painel — pensada para corretores autônomos, equipes e imobiliárias.

## Sobre o projeto

O **ImobiCRM** é um CRM imobiliário em formato SaaS que organiza todo o fluxo comercial: da captação do lead até o fechamento da venda. O gestor acompanha a equipe e os indicadores; o corretor trabalha leads, visitas e propostas no dia a dia; o administrador controla usuários, permissões e configurações.

**Principais recursos:**

- Dashboard com KPIs e gráficos de desempenho
- Gestão de leads com origem, temperatura e histórico
- Funil Kanban com arrastar e soltar entre etapas
- Cadastro e publicação de imóveis
- Área do corretor com metas e carteira
- Controle de comissões por venda
- Agenda de visitas e tarefas
- Módulo WhatsApp (integração simulada, pronto para API)
- Relatórios exportáveis
- Página pública de captação de leads (`/captura`)
- Autenticação com perfis (Administrador, Gestor, Corretor) e recuperação de senha

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
