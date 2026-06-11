# Segurança — ImobiCRM

Revisão de segurança aplicada e checklist para produção.

## Autenticação e autorização

- Senhas hasheadas com **bcrypt** (12 rounds), mínimo **8 caracteres**
- Sessões **JWT** com expiração de 8 horas
- Middleware protege rotas autenticadas e aplica headers de segurança
- **RBAC** por perfil (ADMIN, GESTOR, CORRETOR) em `src/lib/permissions.ts`
- Server Actions validam sessão e permissão antes de mutações
- Tokens de recuperação: **SHA-256** no banco, uso único, expiração 1h, tokens antigos invalidados

## Controles anti-abuso

- **Rate limit** no middleware para `/login`, `/recuperar-senha` e `/captura`
- **Rate limit** nas Server Actions: login (10/15min), reset (3/h), captura (5/min)
- **Honeypot** no formulário público `/captura` (campo `website` oculto)

## Proteção IDOR

- `getLeadById`, `getPropertyById` — corretor só acessa registros próprios
- `sendWhatsAppMessage`, `createTask` — validam posse do lead
- `generateReport` — filtra por `brokerId` para corretores; bloqueia relatório de corretores
- `deleteProperty` — verifica posse antes de excluir
- `getBrokerProfile` — `select` explícito sem `passwordHash`

## Headers HTTP

Configurados em `middleware.ts` e `next.config.ts`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`
- `Strict-Transport-Security` (produção)

## Validação de entrada

- **Zod** em formulários e Server Actions
- `sanitizeString()` limita tamanho de campos de texto
- E-mails normalizados para lowercase

## Proteção contra ataques comuns

| Ameaça | Mitigação |
|--------|-----------|
| SQL Injection | Prisma ORM (queries parametrizadas) |
| XSS | React escapa output; CSP configurado |
| CSRF | Server Actions do Next.js + form-action restrito |
| Brute force | Rate limiting em login e reset |
| IDOR | Verificação de `brokerId` para corretores |
| Mass assignment | Schemas Zod explícitos por action |
| Bots em captura | Honeypot + rate limit |

## LGPD

- Dados pessoais acessíveis apenas por usuários autenticados
- Corretores veem apenas seus próprios leads/imóveis
- Página pública de captação informa tratamento de dados

## Checklist produção

- [ ] Definir `AUTH_SECRET` forte (32+ bytes aleatórios)
- [ ] PostgreSQL com SSL e credenciais fortes
- [ ] HTTPS obrigatório (HSTS habilitado)
- [ ] Configurar SMTP real para recuperação de senha
- [ ] Rate limit distribuído (Redis/Upstash) em ambiente serverless
- [ ] Backups automáticos do banco
- [ ] CAPTCHA (Cloudflare Turnstile) na captura pública
- [ ] Upload de mídia: validar MIME type, tamanho, storage externo
- [ ] Rotacionar secrets periodicamente
- [ ] `npm audit` periódico

## Pentest manual recomendado

1. Tentar acessar `/dashboard` sem sessão → redireciona para `/login`
2. Corretor A tentando ver lead do Corretor B → erro de acesso
3. Corretor exportando relatório → apenas seus próprios dados
4. Token de reset expirado/usado → rejeitado
5. 10+ logins falhos em 15 min → bloqueio temporário
6. Preencher honeypot em `/captura` → submissão silenciosa sem criar lead

## Variáveis sensíveis

Nunca commitar `.env`. Usar `.env.example` como referência.

**Nota:** tokens de reset existentes (texto puro) precisam ser recriados — rode `npm run db:seed` ou solicite novo reset após deploy.
