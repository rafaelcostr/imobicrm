export default function PrivacidadePage() {
  return (
    <article className="space-y-6" aria-labelledby="privacidade-title">
      <header>
        <h1 id="privacidade-title" className="text-3xl font-bold tracking-tight">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-muted-foreground">
          Última atualização: junho de 2026
        </p>
      </header>

      <section aria-labelledby="sec-coleta">
        <h2 id="sec-coleta" className="text-xl font-semibold">1. Dados coletados</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Coletamos nome, telefone, e-mail e interesse imobiliário quando você preenche o formulário
          de captação ou utiliza nossos serviços. Dados de acesso (e-mail e senha) são utilizados
          apenas por usuários autorizados do sistema interno.
        </p>
      </section>

      <section aria-labelledby="sec-uso">
        <h2 id="sec-uso" className="text-xl font-semibold">2. Finalidade do tratamento</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Os dados são utilizados para contato comercial, gestão de leads, atendimento imobiliário
          e cumprimento de obrigações legais. Não vendemos nem compartilhamos dados com terceiros
          para fins de marketing sem consentimento.
        </p>
      </section>

      <section aria-labelledby="sec-direitos">
        <h2 id="sec-direitos" className="text-xl font-semibold">3. Seus direitos (LGPD)</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados entrando
          em contato com o responsável pelo tratamento indicado pela imobiliária ou corretor
          responsável pelo atendimento.
        </p>
      </section>

      <section aria-labelledby="sec-seguranca">
        <h2 id="sec-seguranca" className="text-xl font-semibold">4. Segurança</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Adotamos medidas técnicas como criptografia de senhas, controle de acesso por perfil
          e rate limiting em formulários públicos para proteger suas informações.
        </p>
      </section>
    </article>
  );
}
