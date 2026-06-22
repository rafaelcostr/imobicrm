# Syntra Imóveis — Roadmap de Evolução

> Objetivo: evoluir o MVP atual para um CRM imobiliário completo, inspirado no Kommo, com diferenciais do mercado imobiliário brasileiro.
>
> **Base atual:** ~6/10 como CRM imobiliário · ~4/10 vs Kommo genérico
>
> **Projeto:** `C:\Users\HUNTER\Documents\PROJETOS\imobicrm`

---

## Visão do produto

```
Captação → Lead → Funil → Visita → Proposta → Venda → Comissão
                ↕
         WhatsApp / E-mail / Tarefas / Automações
```

**Diferencial vs Kommo:** imóveis, vitrine pública, match lead-imóvel, comissões e fluxo de negociação já embutidos no produto.

---

## Estado atual (resumo)

### ✅ Já funciona bem
- Dashboard com KPIs e gráficos
- Leads (CRUD, histórico, notas, temperatura, origem)
- Funil Kanban com drag & drop
- Imóveis (CRUD, mídia S3/R2, vitrine pública)
- Negociações (visitas, propostas, vendas)
- Comissões (cálculo e listagem)
- WhatsApp (API Meta + inbox no lead + fallback wa.me)
- E-mail vinculado ao lead (envio SMTP + histórico na ficha)
- Automações (6 regras pré-configuradas + distribuição de leads)
- Webhooks de leads + Meta Lead Ads + embed + importação CSV
- Captação pública com LGPD (`/captura`)
- Auth com 3 perfis + recuperação de senha
- RBAC no código (`permissions.ts`, `access-control.ts`)

### ⚠️ Parcial (backend existe, UI incompleta)
- IMAP inbound por corretor (recebimento automático de e-mail)
- Calendário Google (sync visitas/tarefas)
- Webhooks de portais nativos (integração direta OLX/Zap API)
- Multi-tenant SaaS
- Campos customizáveis / funis customizáveis

### ❌ Ainda não existe
- Inbox unificada (WhatsApp + e-mail)

---

## Fases do roadmap

```
Fase 0 ──► Estabilizar MVP          (1–2 semanas)
Fase 1 ──► CRM operacional          (2–3 semanas)
Fase 2 ──► Comunicação real         (3–4 semanas)
Fase 3 ──► Automações               (2–3 semanas)
Fase 4 ──► Integrações & escala     (3–4 semanas)
Fase 5 ──► SaaS multi-tenant        (4–6 semanas, opcional)
```

---

## Fase 0 — Estabilizar o MVP
**Prazo estimado:** 1–2 semanas  
**Meta:** tudo que já existe no código passa a funcionar de ponta a ponta na interface.

| # | Entrega | Prioridade | Status |
|---|---------|------------|--------|
| 0.1 | Agenda completa: criar, editar, concluir e excluir tarefas | Alta | ✅ Concluído |
| 0.2 | Central de notificações no sino do header | Alta | ✅ Concluído |
| 0.3 | UI para alterar status de comissão (Pendente → Pago) | Média | ✅ Concluído |
| 0.4 | Upload de anexos no lead | Média | ✅ Concluído |
| 0.5 | Busca global funcional (leads, imóveis, corretores) | Média | ✅ Concluído |
| 0.6 | Corrigir stubs: exportação Excel/PDF em relatórios | Baixa | ✅ Concluído |

**Critério de conclusão:** corretor consegue usar o sistema no dia a dia sem “funcionalidade pela metade”.

---

## Fase 1 — CRM operacional (paridade básica com Kommo)
**Prazo estimado:** 2–3 semanas  
**Meta:** painel administrativo e configurações reais.

| # | Entrega | Prioridade | Detalhes |
|---|---------|------------|----------|
| 1.1 | Gestão de usuários | Alta | ✅ Concluído |
| 1.2 | Gestão de equipes | Alta | ✅ Concluído |
| 1.3 | Configurações do sistema | Alta | ✅ Concluído |
| 1.4 | Timeline unificada no lead | Alta | ✅ Concluído |
| 1.5 | Filtros avançados em leads e imóveis | Média | ✅ Concluído |
| 1.6 | Duplicidade de leads | Média | ✅ Concluído |
| 1.7 | Log de auditoria visível | Baixa | ✅ Concluído (via timeline) |

**Novas rotas sugeridas:**
- `/configuracoes/usuarios`
- `/configuracoes/equipes`
- `/configuracoes/integracoes`
- `/configuracoes/funil`

**Critério de conclusão:** admin configura equipe e sistema sem editar banco ou seed.

---

## Fase 2 — Comunicação real (core do Kommo)
**Prazo estimado:** 3–4 semanas  
**Meta:** WhatsApp e e-mail integrados na ficha do lead.

| # | Entrega | Prioridade | Detalhes |
|---|---------|------------|----------|
| 2.1 | WhatsApp Business API (Cloud API) | Alta | ✅ Webhook + envio + status |
| 2.2 | Inbox por lead | Alta | ✅ `/leads/[id]` e `/whatsapp` |
| 2.3 | Templates de mensagem editáveis | Média | ✅ CRUD na página WhatsApp |
| 2.4 | E-mail vinculado ao lead | Média | ✅ Envio SMTP + histórico + mailto fallback |
| 2.5 | Link `wa.me` como fallback | Baixa | ✅ Quando API não configurada |

**Stack sugerida:**
- Meta WhatsApp Cloud API (ou Evolution API / Z-API como alternativa BR)
- Webhook route: `src/app/api/webhooks/whatsapp/route.ts`
- Fila de mensagens com retry (opcional: BullMQ + Redis)

**Variáveis de ambiente novas:**
```
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_WEBHOOK_SECRET=
```

**Critério de conclusão:** corretor responde lead pelo CRM e vê histórico sem sair do sistema.

---

## Fase 3 — Automações inteligentes
**Prazo estimado:** 2–3 semanas  
**Meta:** reduzir trabalho manual; superar o Kommo em fluxo imobiliário.

| # | Entrega | Prioridade | Exemplo |
|---|---------|------------|---------|
| 3.1 | Motor de regras simples | Alta | ✅ Engine + triggers + logs |
| 3.2 | Automação de funil | Alta | ✅ Visita concluída → Proposta |
| 3.3 | Distribuição inteligente de leads | Média | ✅ Round-robin, carga e região |
| 3.4 | Mensagem automática pós-captação | Média | ✅ WhatsApp template na captação |
| 3.5 | Alertas de lead frio | Média | ✅ Cron + notificação ao corretor |
| 3.6 | Automação de comissão | Baixa | ✅ Notificação ao fechar venda |

**Modelo sugerido no Prisma:**
```prisma
model Automation {
  id        String
  trigger   String   // lead_created, stage_changed, visit_completed
  conditions Json
  actions   Json     // create_task, send_whatsapp, move_stage
  isActive  Boolean
}
```

**Critério de conclusão:** pelo menos 5 automações pré-configuradas ativas para imobiliária.

---

## Fase 4 — Integrações e crescimento
**Prazo estimado:** 3–4 semanas  
**Meta:** captar leads de onde o mercado imobiliário realmente vem.

| # | Entrega | Prioridade | Detalhes |
|---|---------|------------|----------|
| 4.1 | Webhook genérico de leads | Alta | ✅ POST /api/webhooks/leads |
| 4.2 | Meta Lead Ads | Alta | ✅ POST /api/webhooks/meta-leads |
| 4.3 | Formulário embed | Média | ✅ public/embed.js + API pública |
| 4.4 | Integração portais (Zap, OLX) | Média | ✅ Webhook + importação CSV |
| 4.5 | Relatórios PDF/Excel reais | Média | ✅ Excel (.xlsx) + PDF impressão |
| 4.6 | Calendário Google | Baixa | Pendente |
| 4.7 | API pública documentada | Baixa | ✅ Docs em /configuracoes/integracoes |

**Critério de conclusão:** lead de anúncio no Instagram cai direto no funil sem digitação manual.

---

## Fase 5 — SaaS multi-tenant (opcional)
**Prazo estimado:** 4–6 semanas  
**Meta:** vender o **Syntra Imóveis** (plataforma **Syntra CRM**) para várias imobiliárias.  
**Status:** ✅ Concluída (billing real pendente para produção)

| # | Entrega | Prioridade | Detalhes |
|---|---------|------------|----------|
| 5.1 | Modelo `Organization` (tenant) | Alta | ✅ `organizationId` em entidades + seed 2 orgs |
| 5.2 | Subdomínio ou slug por cliente | Alta | ✅ Cookie `tenant_slug` + middleware |
| 5.3 | Onboarding self-service | Média | ✅ `/cadastro` com trial 14 dias |
| 5.4 | Billing (Stripe / Asaas) | Média | ⏳ Campos em `Organization` (stub) |
| 5.5 | Super-admin | Média | ✅ `/super-admin` + `super@syntra.app` |
| 5.6 | Limites por plano | Baixa | ✅ `assertOrganizationLimit` em creates |

**Critério de conclusão:** 2 imobiliárias rodando no mesmo deploy sem ver dados uma da outra. ✅

**Migração local:**
```bash
npx prisma migrate dev --name saas_multitenant
npm run db:seed
```

**Credenciais seed:**
- Super: `super@syntra.app` / `Syntra@2026`
- Alpha (`alpha-imoveis`): `admin@syntra.app`, `gestor@syntra.app`, `joao@syntra.app`
- Beta (`beta-imoveis`): `admin@beta-imoveis.com`

---

## Melhorias sobre o Kommo (diferenciais imobiliários)

Estas features devem ser mantidas e ampliadas — é o que torna o **Syntra Imóveis** melhor que um CRM genérico:

| Diferencial | Situação | Próximo passo |
|-------------|----------|---------------|
| Match lead ↔ imóvel | ✅ Existe | Score por preferência + alertas automáticos |
| Vitrine pública | ✅ Existe | SEO, filtros por mapa, compartilhamento WhatsApp |
| Fluxo visita → proposta → venda | ✅ Existe | Gerar PDF de proposta |
| Comissões por venda | ✅ Existe | Split multi-corretor, regras por imóvel |
| Captação com LGPD | ✅ Existe | Consentimento versionado, exportação de dados |
| Metas do corretor | ✅ Existe | Gamificação, ranking da equipe |
| **Novo:** Contrato PDF | ❌ | Template de contrato de corretagem |
| **Novo:** Mapa de imóveis | ❌ | Google Maps / OpenStreetMap na vitrine |
| **Novo:** Simulador de financiamento | ❌ | SAC/Price no detalhe do imóvel |

---

## Priorização recomendada (ordem de execução)

```
1. Fase 0  → rápido, alto impacto, usa código existente
2. Fase 1  → admin + settings (bloqueia escala)
3. Fase 2  → WhatsApp real (maior valor percebido vs Kommo)
4. Fase 3  → automações (diferencial competitivo)
5. Fase 4  → integrações de captação
6. Fase 5  → só se for vender como SaaS para várias imobiliárias
```

---

## Métricas de sucesso por fase

| Fase | KPI |
|------|-----|
| 0 | 100% das actions do backend têm UI correspondente |
| 1 | Admin cria usuário e equipe sem suporte técnico |
| 2 | ≥ 80% das conversas com leads via WhatsApp no CRM |
| 3 | ≥ 3 automações ativas por conta |
| 4 | ≥ 1 fonte externa de leads integrada (Meta, webhook, portal) |
| 5 | ≥ 2 tenants isolados em produção |

---

## Stack adicional prevista

| Necessidade | Tecnologia sugerida |
|-------------|---------------------|
| WhatsApp | Meta Cloud API ou Z-API |
| Filas | BullMQ + Redis (opcional) |
| PDF | `@react-pdf/renderer` ou Puppeteer |
| Excel | `exceljs` |
| Mapas | Leaflet ou Google Maps API |
| Billing | Stripe ou Asaas |
| Monitoramento | Sentry + Vercel Analytics |

---

## Próximo passo imediato

**Fase 1 concluída.** Iniciar **Fase 2 — WhatsApp Business API** e inbox unificada no lead.

---

*Última atualização: junho/2026*
