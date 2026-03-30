import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import heroImage from "@/assets/blog-lgpd-seguranca-hero.jpg";

export default function LgpdSeguranca() {
  return (
    <BlogArticleLayout title="LGPD e Segurança de Dados no Google Meu Negócio" category="Google Meu Negócio" date="2 de março de 2026">
      <img src={heroImage} alt="LGPD e segurança de dados com cadeado digital e escudo de proteção" width={1920} height={1080} style={{ borderRadius: 12, marginBottom: 32, width: "100%", height: "auto" }} />
      <p>Se você tem um negócio local no Brasil, a <strong>LGPD (Lei Geral de Proteção de Dados)</strong> se aplica a você — mesmo que você ache que "só tem um perfil no Google". Neste artigo, explicamos o que você precisa saber e fazer para proteger seu negócio e seus clientes.</p>

      <h2>O que é a LGPD e por que importa para negócios locais?</h2>
      <p>A LGPD (Lei nº 13.709/2018) regula como empresas coletam, armazenam e usam dados pessoais no Brasil. Isso inclui:</p>
      <ul>
        <li>Nomes e telefones de clientes</li>
        <li>Endereços de e-mail</li>
        <li>Dados de agendamento</li>
        <li>Histórico de compras ou atendimentos</li>
        <li>Informações de WhatsApp</li>
      </ul>
      <p><strong>Se você coleta qualquer dado de cliente, a LGPD se aplica a você.</strong></p>

      <h2>Riscos de não cumprir a LGPD</h2>
      <ul>
        <li><strong>Multas</strong> — até 2% do faturamento, limitado a R$ 50 milhões por infração</li>
        <li><strong>Danos à reputação</strong> — clientes perdem confiança em negócios que não protegem dados</li>
        <li><strong>Processos judiciais</strong> — clientes podem processar por uso indevido de dados</li>
        <li><strong>Bloqueio de dados</strong> — a ANPD pode determinar a suspensão do uso de dados</li>
      </ul>

      <h2>Google Meu Negócio e dados pessoais</h2>
      <p>Quando um cliente deixa uma avaliação no seu perfil do Google, ele já está compartilhando dados públicos. Mas atenção:</p>
      <ul>
        <li><strong>Não publique dados pessoais de clientes</strong> em respostas de avaliações (ex: nome completo, CPF, detalhes de atendimento)</li>
        <li><strong>Fotos com clientes</strong> — tenha consentimento antes de publicar</li>
        <li><strong>Mensagens pelo GBP</strong> — dados compartilhados por chat devem ser protegidos</li>
      </ul>

      <h2>Boas práticas de segurança para negócios locais</h2>
      <h3>1. Controle de acesso ao perfil</h3>
      <ul>
        <li>Use autenticação de 2 fatores na conta Google</li>
        <li>Limite quem tem acesso administrativo ao GBP</li>
        <li>Revise permissões periodicamente</li>
        <li>Nunca compartilhe senha por WhatsApp ou e-mail</li>
      </ul>

      <h3>2. Cuidado com ferramentas de terceiros</h3>
      <ul>
        <li>Verifique se ferramentas que acessam seu GBP usam OAuth (autorização segura)</li>
        <li>Evite fornecer senha diretamente a qualquer serviço</li>
        <li>Prefira plataformas que usam APIs oficiais do Google</li>
      </ul>
      <blockquote>O LocalAI usa exclusivamente a API oficial do Google e OAuth 2.0 — seus dados nunca são armazenados de forma insegura e você pode revogar o acesso a qualquer momento.</blockquote>

      <h3>3. Política de privacidade</h3>
      <ul>
        <li>Tenha uma política de privacidade acessível (pode estar no seu Mini Site)</li>
        <li>Informe quais dados coleta e para quê</li>
        <li>Ofereça um canal para solicitações de exclusão de dados</li>
      </ul>

      <h3>4. WhatsApp e comunicação com clientes</h3>
      <ul>
        <li>Não adicione clientes a grupos sem consentimento</li>
        <li>Use listas de transmissão com opt-in (autorização prévia)</li>
        <li>Mantenha registro de consentimento</li>
        <li>Ofereça opção de descadastramento fácil</li>
      </ul>

      <h2>Como o LocalAI protege seus dados</h2>
      <ul>
        <li><strong>Criptografia</strong> — tokens de acesso são armazenados com criptografia</li>
        <li><strong>API oficial do Google</strong> — sem acesso direto à sua senha</li>
        <li><strong>Controle do usuário</strong> — você pode revogar permissões a qualquer momento</li>
        <li><strong>Sem venda de dados</strong> — seus dados e os dos seus clientes nunca são compartilhados</li>
        <li><strong>Conformidade LGPD</strong> — política de privacidade transparente e canal de DPO disponível</li>
      </ul>

      <h2>Checklist rápido de LGPD para negócios locais</h2>
      <ul>
        <li>✅ Tenha uma política de privacidade publicada</li>
        <li>✅ Colete apenas dados necessários</li>
        <li>✅ Guarde consentimento de clientes</li>
        <li>✅ Use autenticação de 2 fatores em todas as contas</li>
        <li>✅ Revise quem tem acesso ao seu perfil do Google</li>
        <li>✅ Não publique dados pessoais de clientes publicamente</li>
        <li>✅ Tenha canal de contato para solicitações de dados</li>
        <li>✅ Use ferramentas que garantem segurança (APIs oficiais)</li>
      </ul>

      <h2>Conclusão</h2>
      <p>A LGPD não é um bicho de sete cabeças, mas <strong>ignorá-la pode sair muito caro</strong>. Para negócios locais, as ações necessárias são simples e diretas. O mais importante é ter consciência de quais dados você coleta e garantir que estão protegidos.</p>
      <p>Ao usar ferramentas como o LocalAI, você já conta com uma camada extra de segurança e conformidade — sem precisar se preocupar com aspectos técnicos.</p>
    </BlogArticleLayout>
  );
}
