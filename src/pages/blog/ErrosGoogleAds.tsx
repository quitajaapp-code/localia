import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import heroImage from "@/assets/blog-erros-google-ads-hero.jpg";

const faq = [
  { question: "Quanto custa anunciar no Google Ads para restaurantes?", answer: "O CPC médio para restaurantes no Brasil varia de R$ 0,50 a R$ 3,00. Com R$ 500 a R$ 2.000/mês bem aplicados, já é possível ter resultados visíveis." },
  { question: "Google Ads funciona para negócios locais pequenos?", answer: "Sim. Diferente das redes sociais, no Google o cliente já tem intenção de compra. Com segmentação geográfica correta, mesmo verbas pequenas convertem." },
  { question: "Qual o erro mais comum em Google Ads para restaurantes?", answer: "Usar palavras-chave muito genéricas como 'restaurante' ou 'comida', atraindo cliques fora da região e desperdiçando verba." },
  { question: "A IA pode gerenciar meu Google Ads?", answer: "Sim. O LocalAI configura, lança e otimiza campanhas automaticamente — ajustando lances, pausando palavras ruins e sugerindo melhorias sem que você precise abrir o Google Ads." },
  { question: "Preciso de uma landing page para Google Ads?", answer: "Sim. Enviar o clique para Instagram ou página genérica desperdiça dinheiro. Um Mini Site focado com cardápio e WhatsApp é ideal e já vem incluso no LocalAI." },
];

export default function ErrosGoogleAds() {
  return (
    <BlogArticleLayout
      title="Google Ads para Restaurantes: Erros Caros em 2026"
      category="Google Ads"
      date="18 de março de 2026"
      metaDescription="Os 7 erros mais caros em Google Ads para restaurantes e negócios locais. Aprenda a evitá-los e otimizar campanhas com IA."
      slug="/blog/erros-google-ads-restaurantes-2026"
      imageUrl="https://localai.app.br/assets/blog-erros-google-ads-hero.jpg"
      faq={faq}
    >
      <img src={heroImage} alt="Dashboard de Google Ads para restaurante brasileiro com métricas de cliques, chamadas e ROI 7.2x" width={1920} height={1080} style={{ borderRadius: 12, marginBottom: 32, width: "100%", height: "auto" }} />
      <p><strong>Google Ads pode ser a melhor ferramenta para atrair clientes — ou um buraco negro que engole seu dinheiro.</strong> A diferença está nos detalhes da configuração. Baseado na experiência do LocalAI com +500 negócios locais, listamos os 7 erros mais caros e como evitá-los.</p>

      <h2>Por que Google Ads faz sentido para restaurantes?</h2>
      <p>Quando alguém busca "restaurante japonês perto de mim" ou "melhor pizza em [cidade]", está com <strong>intenção real de compra</strong>. Diferente das redes sociais, onde o cliente está rolando o feed sem pensar em comer fora, no Google ele já decidiu — só precisa escolher onde.</p>

      <h2>Quais são os 7 erros mais caros em Google Ads?</h2>
      <h3>1. Usar palavras-chave muito genéricas</h3>
      <p><strong>Erro:</strong> anunciar para "restaurante" ou "comida". <strong>Correto:</strong> usar termos específicos como "restaurante italiano zona sul SP" ou "delivery de marmita em Campinas".</p>
      <h3>2. Não usar palavras-chave negativas</h3>
      <p>Se você é um restaurante premium, não quer aparecer para "restaurante barato" ou "self-service". Palavras-chave negativas <strong>bloqueiam buscas irrelevantes</strong>.</p>
      <h3>3. Não configurar a segmentação geográfica</h3>
      <p>Anunciar para o Brasil inteiro quando seu restaurante atende um raio de 10 km. Configure 5-15 km ao redor do seu endereço.</p>
      <h3>4. Landing page ruim (ou sem landing page)</h3>
      <p>Mandar o clique para o Instagram é jogar dinheiro fora. O ideal é uma <strong>página focada com cardápio, WhatsApp e endereço</strong> — exatamente o que um Mini Site oferece.</p>
      <h3>5. Não usar extensões de anúncio</h3>
      <p>Extensões como telefone, endereço e promoções aumentam a taxa de clique em até 15%. São gratuitas e muitos restaurantes não configuram.</p>
      <h3>6. Orçamento mal distribuído</h3>
      <p><strong>Concentre verba nos horários de pico</strong> — véspera de feriado, sexta e sábado, horário de almoço e jantar.</p>
      <h3>7. Nunca otimizar a campanha</h3>
      <p>Criar a campanha e "deixar rodando" é o erro número 1. Campanhas precisam de <strong>ajustes semanais</strong>.</p>
      <blockquote>No LocalAI, a IA monitora e otimiza suas campanhas automaticamente — ajustando lances, pausando palavras ruins e sugerindo melhorias.</blockquote>

      <h2>Quanto investir em Google Ads?</h2>
      <p>Para restaurantes locais, um investimento de <strong>R$ 500 a R$ 2.000/mês</strong> já traz resultados visíveis — desde que a campanha esteja bem configurada.</p>

      <h2>Quais métricas acompanhar?</h2>
      <ul>
        <li><strong>CPC (Custo por Clique)</strong> — quanto você paga por cada visita</li>
        <li><strong>CTR (Taxa de Clique)</strong> — acima de 5% é bom para negócios locais</li>
        <li><strong>Conversões</strong> — ligações, cliques no WhatsApp, pedidos de rota</li>
        <li><strong>ROAS</strong> — retorno sobre o investimento em anúncios</li>
      </ul>

      <h2>Conclusão</h2>
      <p>Google Ads para restaurantes funciona — mas só quando feito direito. Evitar esses 7 erros já coloca você à frente de 80% dos concorrentes que anunciam sem estratégia.</p>
      <p>O LocalAI configura, lança e otimiza suas campanhas com IA — usado por +500 negócios locais brasileiros.</p>
    </BlogArticleLayout>
  );
}
