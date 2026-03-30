import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Terms() {
  usePageTitle("Termos de Serviço");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkLogo />
      <main className="container max-w-3xl py-24 md:py-32 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Termos de Serviço</h1>
        <p className="text-sm text-muted-foreground">Última atualização: 29 de março de 2026</p>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou utilizar a plataforma <strong className="text-foreground">LocalAI</strong> ("Plataforma"),
            disponível em <strong className="text-foreground">localai.app.br</strong>, você concorda em cumprir
            e ficar vinculado a estes Termos de Serviço. Se não concordar, não utilize a Plataforma.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Descrição do Serviço</h2>
          <p>A LocalAI é uma plataforma de automação para negócios locais que oferece:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Gerenciamento automatizado de perfis no Google Business Profile.</li>
            <li>Respostas automáticas a avaliações utilizando inteligência artificial.</li>
            <li>Criação e publicação de posts no Google Business Profile.</li>
            <li>Criação e otimização de campanhas no Google Ads.</li>
            <li>Relatórios de desempenho e sugestões de otimização por IA.</li>
            <li>CRM integrado com automação de follow-up via WhatsApp.</li>
            <li>Criação de mini-sites otimizados para SEO local.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">3. Cadastro e Conta</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Você deve fornecer informações verdadeiras e atualizadas ao se cadastrar.</li>
            <li>É responsável por manter a confidencialidade de suas credenciais de acesso.</li>
            <li>Deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.</li>
            <li>Deve ter pelo menos 18 anos para utilizar a Plataforma.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">4. Planos e Pagamentos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>A Plataforma oferece planos gratuitos e pagos conforme descrito na página de preços.</li>
            <li>Os pagamentos são processados pelo Stripe de forma recorrente (mensal).</li>
            <li>Você pode cancelar sua assinatura a qualquer momento pelo painel de configurações.</li>
            <li>Não há reembolso para períodos parciais já pagos.</li>
            <li>Reservamo-nos o direito de alterar preços com aviso prévio de 30 dias.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">5. Uso Aceitável</h2>
          <p>Ao utilizar a Plataforma, você concorda em NÃO:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violar leis ou regulamentos aplicáveis.</li>
            <li>Publicar conteúdo falso, enganoso, difamatório ou ilegal.</li>
            <li>Manipular avaliações ou criar avaliações falsas.</li>
            <li>Utilizar a Plataforma para spam ou comunicações não solicitadas.</li>
            <li>Tentar acessar dados de outros usuários sem autorização.</li>
            <li>Realizar engenharia reversa ou tentar extrair o código-fonte.</li>
            <li>Sobrecarregar a infraestrutura com requisições excessivas.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">6. Integrações com Google</h2>
          <p>
            A Plataforma se integra com serviços do Google (Google Business Profile, Google Ads)
            mediante sua autorização expressa via OAuth2. Ao conectar sua conta:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Você autoriza a LocalAI a acessar e gerenciar dados conforme os escopos solicitados.</li>
            <li>Pode revogar o acesso a qualquer momento nas configurações da Plataforma ou diretamente em sua conta Google.</li>
            <li>A LocalAI não se responsabiliza por ações realizadas automaticamente que estejam de acordo com suas configurações.</li>
            <li>
              O uso de dados do Google segue a{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                Política de Dados de Usuário dos Serviços de API do Google
              </a>.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">7. Inteligência Artificial</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>A Plataforma utiliza modelos de IA para gerar conteúdo (respostas a avaliações, posts, textos de anúncios).</li>
            <li>O conteúdo gerado por IA é uma sugestão e pode ser editado antes da publicação.</li>
            <li>A LocalAI não garante a precisão, adequação ou legalidade do conteúdo gerado.</li>
            <li>Você é responsável por revisar e aprovar o conteúdo antes de sua publicação.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">8. Propriedade Intelectual</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>A Plataforma, incluindo código, design, marca e funcionalidades, é propriedade da LocalAI.</li>
            <li>O conteúdo que você cria ou publica através da Plataforma permanece de sua propriedade.</li>
            <li>Você concede à LocalAI uma licença limitada para processar seu conteúdo conforme necessário para o funcionamento do serviço.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">9. Limitação de Responsabilidade</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>A Plataforma é fornecida "como está" sem garantias de qualquer tipo.</li>
            <li>Não garantimos disponibilidade ininterrupta ou livre de erros.</li>
            <li>Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais.</li>
            <li>Nossa responsabilidade total é limitada ao valor pago nos últimos 12 meses.</li>
            <li>Não nos responsabilizamos por ações de terceiros (Google, Stripe, etc.).</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">10. Suspensão e Encerramento</h2>
          <p>Reservamo-nos o direito de suspender ou encerrar sua conta caso:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Viole estes Termos de Serviço.</li>
            <li>Utilize a Plataforma de forma fraudulenta ou abusiva.</li>
            <li>Não efetue o pagamento de valores devidos.</li>
          </ul>
          <p>Em caso de encerramento, seus dados serão tratados conforme nossa Política de Privacidade.</p>

          <h2 className="text-lg font-semibold text-foreground">11. Alterações nos Termos</h2>
          <p>
            Podemos modificar estes Termos a qualquer momento. Mudanças significativas serão comunicadas
            com pelo menos 30 dias de antecedência por e-mail ou notificação na Plataforma. O uso
            continuado após as alterações constitui aceitação dos novos termos.
          </p>

          <h2 className="text-lg font-semibold text-foreground">12. Lei Aplicável</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa
            será resolvida no foro da comarca de domicílio do usuário, conforme o Código de Defesa
            do Consumidor.
          </p>

          <h2 className="text-lg font-semibold text-foreground">13. Contato</h2>
          <p>Para dúvidas sobre estes Termos:</p>
          <ul className="list-none space-y-1">
            <li><strong className="text-foreground">LocalAI</strong></li>
            <li>E-mail: <a href="mailto:contato@localai.app.br" className="text-primary underline hover:text-primary/80">contato@localai.app.br</a></li>
            <li>Website: <a href="https://localai.app.br" className="text-primary underline hover:text-primary/80">localai.app.br</a></li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
