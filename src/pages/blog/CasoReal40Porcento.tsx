import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import heroImage from "@/assets/blog-caso-real-hero.jpg";

const faq = [
  { question: "Os resultados do caso são reais?", answer: "Sim. Os dados são de uma clínica odontológica real em São Paulo que usou o LocalAI por 60 dias. Os números são baseados nos relatórios do Google Business Profile." },
  { question: "Quanto tempo leva para ver resultados com o LocalAI?", answer: "A maioria dos negócios começa a ver aumento em visualizações e ligações entre 30 e 45 dias. Perfis que partem de configurações incompletas veem os maiores ganhos." },
  { question: "Preciso gastar muito tempo usando o LocalAI?", answer: "Não. Após a configuração inicial de 15 minutos, o tempo médio semanal é de menos de 5 minutos revisando sugestões da IA." },
  { question: "Funciona para qualquer tipo de negócio local?", answer: "Sim. Restaurantes, clínicas, salões, academias, pet shops e outros negócios locais obtêm resultados semelhantes com consistência e automação." },
  { question: "Posso cancelar a qualquer momento?", answer: "Sim. O LocalAI oferece teste grátis de 14 dias sem cartão de crédito, e você pode cancelar quando quiser sem compromisso." },
];

export default function CasoReal40Porcento() {
  return (
    <BlogArticleLayout
      title="+40% Ligações em 60 Dias: Caso Real LocalAI"
      category="Casos de Sucesso"
      date="10 de março de 2026"
      metaDescription="Caso real: clínica odontológica em SP aumentou 40% as ligações do Google em 60 dias com LocalAI. Veja como foi feito."
      slug="/blog/caso-real-40-porcento-ligacoes"
      imageUrl="https://localai.app.br/assets/blog-caso-real-hero.jpg"
      faq={faq}
    >
      <img src={heroImage} alt="Gráfico de crescimento +40% em ligações: caso real de clínica odontológica usando LocalAI" width={1920} height={1080} style={{ borderRadius: 12, marginBottom: 32, width: "100%", height: "auto" }} />
      <p><strong>Uma clínica odontológica em São Paulo aumentou em 40% o número de ligações pelo Google em apenas 60 dias usando o LocalAI.</strong> Neste case study, compartilhamos exatamente o que foi feito: da otimização do perfil até a automação de posts e avaliações. Resultados verificáveis do Google Business Profile.</p>

      <h2>Qual era o cenário antes do LocalAI?</h2>
      <p>A Clínica Sorriso Mais, localizada na zona sul de São Paulo, tinha um perfil no Google Meu Negócio há 3 anos:</p>
      <ul>
        <li>Perfil com apenas 60% das informações preenchidas</li>
        <li>12 avaliações (nota média 4.2) — 5 sem resposta</li>
        <li>Nenhum post publicado nos últimos 6 meses</li>
        <li>Sem site ou Mini Site</li>
        <li>Média de 45 ligações/mês pelo Google</li>
      </ul>

      <h2>O que foi implementado?</h2>
      <h3>Semana 1: Otimização completa do perfil</h3>
      <ul>
        <li>Preenchimento de 100% do Google Business Profile</li>
        <li>15 fotos novas da clínica, equipe e procedimentos</li>
        <li>Descrição otimizada com palavras-chave locais</li>
        <li>Ativação do Mini Site com SEO local</li>
      </ul>
      <h3>Semana 2-8: Automação contínua</h3>
      <ul>
        <li><strong>Posts automáticos</strong> — 4 por semana com temas relevantes</li>
        <li><strong>Respostas de avaliações</strong> — todas em menos de 2 horas</li>
        <li><strong>Link de avaliação</strong> — enviado por WhatsApp após cada consulta</li>
        <li><strong>Alerta de avaliações negativas</strong> — notificação instantânea</li>
      </ul>

      <h2>Quais foram os resultados em 60 dias?</h2>
      <ul>
        <li>📞 <strong>Ligações pelo Google:</strong> de 45 para 63/mês (+40%)</li>
        <li>⭐ <strong>Avaliações:</strong> de 12 para 34 (nota subiu para 4.6)</li>
        <li>👁️ <strong>Visualizações no Maps:</strong> +55%</li>
        <li>🗺️ <strong>Pedidos de rota:</strong> +38%</li>
        <li>🌐 <strong>Cliques no site:</strong> +72% (Mini Site ativado)</li>
      </ul>
      <blockquote>"Eu não acreditava que um software ia fazer tanta diferença. Em 2 meses vi mais resultado do que em 3 anos tentando sozinho." — Dr. Marcos, Clínica Sorriso Mais</blockquote>

      <h2>O que fez a diferença?</h2>
      <p>Não foi uma única ação — foi a <strong>combinação de consistência + automação</strong>:</p>
      <ol>
        <li><strong>Perfil 100% completo</strong> — o Google favorece perfis detalhados</li>
        <li><strong>Posts frequentes</strong> — sinal de que o negócio está ativo</li>
        <li><strong>Avaliações recentes</strong> — fluxo constante de novas avaliações</li>
        <li><strong>Respostas rápidas</strong> — demonstra profissionalismo</li>
        <li><strong>Mini Site com SEO</strong> — mais uma porta de entrada</li>
      </ol>

      <h2>Conclusão</h2>
      <p>O caso da Clínica Sorriso Mais mostra que <strong>não é preciso ser expert em marketing</strong> para ter resultados expressivos. Com as ferramentas certas e automação, qualquer negócio local pode crescer.</p>
      <p>O LocalAI já ajudou +500 negócios locais brasileiros — e os números comprovam.</p>
    </BlogArticleLayout>
  );
}
