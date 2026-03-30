import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import heroImage from "@/assets/blog-lgpd-seguranca-hero.jpg";

const faq = [
  { question: "A LGPD se aplica ao meu negócio local?", answer: "Sim. Se você coleta qualquer dado de cliente (nome, telefone, e-mail, agendamento), a LGPD se aplica, independentemente do tamanho do negócio." },
  { question: "Qual a multa por não cumprir a LGPD?", answer: "Até 2% do faturamento anual, limitado a R$ 50 milhões por infração. Além de multas, pode haver bloqueio de dados e danos à reputação." },
  { question: "O LocalAI é seguro para meus dados?", answer: "Sim. O LocalAI usa a API oficial do Google com OAuth 2.0, criptografia de tokens e nunca armazena sua senha. Você pode revogar o acesso a qualquer momento." },
  { question: "Preciso de uma política de privacidade?", answer: "Sim. Toda empresa que coleta dados pessoais precisa ter uma política de privacidade acessível. Ela pode estar no seu site ou Mini Site." },
  { question: "Posso usar WhatsApp para marketing sem problemas?", answer: "Sim, desde que o cliente tenha dado consentimento (opt-in) para receber mensagens. Sempre ofereça opção de descadastramento fácil." },
  { question: "O Google compartilha dados do meu perfil?", answer: "Avaliações e informações publicadas no Google são públicas. Porém, dados internos do seu perfil (métricas, relatórios) são acessíveis apenas por você e ferramentas autorizadas." },
];

export default function LgpdSeguranca() {
  return (
    <BlogArticleLayout
      title="LGPD e Segurança no Google Meu Negócio 2026"
      category="Google Meu Negócio"
      date="2 de março de 2026"
      metaDescription="Guia prático de LGPD para negócios locais. Proteja dados no Google Meu Negócio, WhatsApp e ferramentas de marketing."
      slug="/blog/lgpd-seguranca-google-meu-negocio"
      imageUrl="https://localai.app.br/assets/blog-lgpd-seguranca-hero.jpg"
      faq={faq}
    >
      <img src={heroImage} alt="LGPD e segurança de dados: cadeado digital, escudo de proteção, selos SSL e Google Business Profile" width={1920} height={1080} style={{ borderRadius: 12, marginBottom: 32, width: "100%", height: "auto" }} />
      <p><strong>Se você coleta qualquer dado de cliente — nome, telefone, e-mail ou agendamento — a LGPD se aplica ao seu negócio.</strong> Neste guia prático, explicamos o que negócios locais precisam saber e fazer para proteger dados e evitar multas. Baseado na experiência do LocalAI com +500 negócios em conformidade.</p>

      <h2>O que é a LGPD e por que importa para negócios locais?</h2>
      <p>A LGPD (Lei nº 13.709/2018) regula como empresas coletam, armazenam e usam dados pessoais no Brasil. Isso inclui:</p>
      <ul>
        <li>Nomes e telefones de clientes</li>
        <li>Endereços de e-mail</li>
        <li>Dados de agendamento</li>
        <li>Histórico de compras ou atendimentos</li>
        <li>Informações de WhatsApp</li>
      </ul>

      <h2>Quais são os riscos de não cumprir a LGPD?</h2>
      <ul>
        <li><strong>Multas</strong> — até 2% do faturamento, limitado a R$ 50 milhões</li>
        <li><strong>Danos à reputação</strong> — clientes perdem confiança</li>
        <li><strong>Processos judiciais</strong> — clientes podem processar</li>
        <li><strong>Bloqueio de dados</strong> — a ANPD pode suspender o uso</li>
      </ul>

      <h2>Como proteger dados no Google Meu Negócio?</h2>
      <ul>
        <li>Não publique dados pessoais de clientes em respostas de avaliações</li>
        <li>Tenha consentimento antes de publicar fotos com clientes</li>
        <li>Proteja dados compartilhados por chat</li>
      </ul>

      <h2>Quais as boas práticas de segurança?</h2>
      <h3>1. Controle de acesso ao perfil</h3>
      <ul>
        <li>Use autenticação de 2 fatores</li>
        <li>Limite quem tem acesso administrativo</li>
        <li>Revise permissões periodicamente</li>
      </ul>
      <h3>2. Cuidado com ferramentas de terceiros</h3>
      <ul>
        <li>Verifique se usam OAuth (autorização segura)</li>
        <li>Prefira plataformas com APIs oficiais do Google</li>
      </ul>
      <blockquote>O LocalAI usa exclusivamente a API oficial do Google e OAuth 2.0 — seus dados nunca são armazenados de forma insegura.</blockquote>
      <h3>3. Política de privacidade</h3>
      <ul>
        <li>Tenha uma acessível no seu site ou Mini Site</li>
        <li>Informe quais dados coleta e para quê</li>
        <li>Ofereça canal para exclusão de dados</li>
      </ul>

      <h2>Como o LocalAI protege seus dados?</h2>
      <ul>
        <li><strong>Criptografia</strong> — tokens armazenados com criptografia</li>
        <li><strong>API oficial</strong> — sem acesso direto à sua senha</li>
        <li><strong>Controle total</strong> — revogue permissões a qualquer momento</li>
        <li><strong>Sem venda de dados</strong> — seus dados nunca são compartilhados</li>
        <li><strong>Conformidade LGPD</strong> — política transparente e canal de DPO</li>
      </ul>

      <h2>Conclusão</h2>
      <p>A LGPD não é um bicho de sete cabeças, mas <strong>ignorá-la pode sair muito caro</strong>. As ações necessárias são simples e diretas.</p>
      <p>Com o LocalAI, +500 negócios já contam com segurança e conformidade — sem preocupações técnicas.</p>
    </BlogArticleLayout>
  );
}
