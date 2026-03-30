import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Privacy() {
  usePageTitle("Política de Privacidade");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkLogo />
      <main className="container max-w-3xl py-24 md:py-32 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground">Última atualização: 29 de março de 2026</p>

        <section className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">1. Introdução</h2>
          <p>
            A <strong className="text-foreground">LocalAI</strong> ("nós", "nosso") opera a plataforma acessível em{" "}
            <strong className="text-foreground">localai.app.br</strong>. Esta Política de Privacidade descreve como coletamos,
            usamos, armazenamos e protegemos suas informações pessoais ao utilizar nossos serviços.
          </p>
          <p>
            Ao utilizar a plataforma, você concorda com as práticas descritas nesta política. Caso não concorde,
            por favor não utilize nossos serviços.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Informações que Coletamos</h2>
          <p>Coletamos os seguintes tipos de informações:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail, telefone e informações do negócio (nome da empresa, nicho, cidade).</li>
            <li><strong className="text-foreground">Dados de autenticação:</strong> credenciais de login via e-mail/senha ou provedores OAuth (Google).</li>
            <li><strong className="text-foreground">Dados do Google Business Profile:</strong> avaliações, métricas de desempenho, informações do perfil comercial, acessados mediante sua autorização expressa via OAuth2.</li>
            <li><strong className="text-foreground">Dados do Google Ads:</strong> informações de campanhas, métricas de anúncios e identificadores de conta, acessados mediante sua autorização expressa via OAuth2.</li>
            <li><strong className="text-foreground">Dados de uso:</strong> páginas visitadas, funcionalidades utilizadas, logs de interação com agentes de IA.</li>
            <li><strong className="text-foreground">Dados de pagamento:</strong> processados de forma segura pelo Stripe. Não armazenamos dados de cartão de crédito.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">3. Como Usamos suas Informações</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fornecer, manter e melhorar nossos serviços.</li>
            <li>Gerenciar seu perfil no Google Business Profile com base em suas instruções.</li>
            <li>Criar e otimizar campanhas no Google Ads conforme suas configurações.</li>
            <li>Gerar respostas automáticas a avaliações utilizando inteligência artificial.</li>
            <li>Gerar relatórios de desempenho e sugestões de otimização.</li>
            <li>Enviar comunicações sobre o serviço (atualizações, alertas, notificações).</li>
            <li>Processar pagamentos e gerenciar assinaturas.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">4. Uso de APIs do Google</h2>
          <p>
            Nossa plataforma utiliza APIs do Google (Google Business Profile API e Google Ads API) para fornecer
            funcionalidades de gerenciamento. O uso e a transferência de informações recebidas dessas APIs para
            qualquer outro aplicativo seguirá a{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              Política de Dados de Usuário dos Serviços de API do Google
            </a>
            , incluindo os requisitos de Uso Limitado.
          </p>
          <p>Especificamente:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acessamos apenas os dados necessários para fornecer as funcionalidades solicitadas por você.</li>
            <li>Não vendemos dados obtidos via APIs do Google.</li>
            <li>Não utilizamos dados do Google para fins de publicidade não relacionada ao serviço.</li>
            <li>Os tokens de acesso são armazenados de forma criptografada e podem ser revogados a qualquer momento.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">5. Compartilhamento de Dados</h2>
          <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Provedores de serviço:</strong> Supabase (infraestrutura), Stripe (pagamentos), Google (APIs autorizadas).</li>
            <li><strong className="text-foreground">Obrigações legais:</strong> quando exigido por lei ou ordem judicial.</li>
            <li><strong className="text-foreground">Proteção de direitos:</strong> para proteger nossos direitos, segurança ou propriedade.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">6. Armazenamento e Segurança</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Os dados são armazenados em servidores seguros fornecidos pelo Supabase.</li>
            <li>Tokens de acesso a APIs são criptografados em repouso.</li>
            <li>Utilizamos HTTPS para todas as comunicações.</li>
            <li>Implementamos políticas de Row Level Security (RLS) para isolar dados entre usuários.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">7. Seus Direitos (LGPD)</h2>
          <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acessar seus dados pessoais.</li>
            <li>Corrigir dados incompletos ou desatualizados.</li>
            <li>Solicitar a exclusão de seus dados.</li>
            <li>Revogar consentimento a qualquer momento.</li>
            <li>Solicitar portabilidade dos dados.</li>
            <li>Obter informações sobre o compartilhamento de dados.</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, entre em contato pelo e-mail:{" "}
            <a href="mailto:contato@localai.app.br" className="text-primary underline hover:text-primary/80">
              contato@localai.app.br
            </a>
          </p>

          <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
          <p>
            Utilizamos cookies essenciais para manter sua sessão ativa e cookies analíticos para entender
            como a plataforma é utilizada. Você pode configurar seu navegador para recusar cookies, mas
            algumas funcionalidades podem ser afetadas.
          </p>

          <h2 className="text-lg font-semibold text-foreground">9. Retenção de Dados</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer
            nossos serviços. Após a exclusão da conta, seus dados serão removidos em até 30 dias,
            exceto quando a retenção for exigida por lei.
          </p>

          <h2 className="text-lg font-semibold text-foreground">10. Alterações nesta Política</h2>
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
            por e-mail ou através da plataforma. O uso continuado após alterações constitui aceitação
            da política atualizada.
          </p>

          <h2 className="text-lg font-semibold text-foreground">11. Contato</h2>
          <p>
            Para dúvidas sobre esta política ou sobre o tratamento de seus dados, entre em contato:
          </p>
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
