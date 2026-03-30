import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import heroImage from "@/assets/blog-checklist-gmn-hero.jpg";

const faq = [
  { question: "Quanto tempo leva para configurar o Google Meu Negócio?", answer: "Se você seguir este checklist, leva cerca de 30-45 minutos para preencher 100%. Com o LocalAI, a configuração é guiada e leva menos de 15 minutos." },
  { question: "Quantas fotos devo ter no meu perfil?", answer: "Mínimo 10 fotos reais e recentes. Inclua fachada, interior, equipe, produtos/serviços. Atualize mensalmente para melhores resultados." },
  { question: "Posso adicionar palavras-chave no nome do negócio?", answer: "Não. Use exatamente o nome que aparece na fachada. Adicionar palavras-chave forçadas viola as diretrizes do Google e pode causar suspensão." },
  { question: "Com que frequência devo publicar posts no GBP?", answer: "O ideal é 3-4 vezes por semana. Posts com imagens recebem 2x mais engajamento. O LocalAI automatiza essa publicação." },
  { question: "Preciso responder avaliações positivas também?", answer: "Sim, responda 100% das avaliações. Respostas a avaliações positivas fortalecem o relacionamento e mostram ao Google que você é um negócio engajado." },
];

export default function ChecklistGMN() {
  return (
    <BlogArticleLayout
      title="Checklist Google Meu Negócio: Configure Certo"
      category="Google Meu Negócio"
      date="14 de março de 2026"
      metaDescription="Checklist completo para configurar seu Google Meu Negócio em 2026. Passo a passo para preencher 100% e maximizar ligações."
      slug="/blog/checklist-google-meu-negocio"
      imageUrl="https://localai.app.br/assets/blog-checklist-gmn-hero.jpg"
      faq={faq}
    >
      <img src={heroImage} alt="Checklist completo do Google Meu Negócio com itens marcados: perfil, fotos, posts, respostas" width={1920} height={1080} style={{ borderRadius: 12, marginBottom: 32, width: "100%", height: "auto" }} />
      <p><strong>O Google Meu Negócio é a ferramenta gratuita mais poderosa para negócios locais, mas a maioria preenche menos de 50% do perfil.</strong> Este checklist de 8 passos garante que você aproveite 100% do potencial. Baseado na experiência do LocalAI com +500 negócios atendidos.</p>

      <h2>Como preencher as informações básicas?</h2>
      <ul>
        <li>✅ <strong>Nome do negócio</strong> — exatamente como aparece na fachada</li>
        <li>✅ <strong>Categoria principal</strong> — a mais específica possível</li>
        <li>✅ <strong>Categorias secundárias</strong> — adicione todas que se aplicam (máximo 9)</li>
        <li>✅ <strong>Endereço</strong> — verificado e idêntico ao de outras plataformas</li>
        <li>✅ <strong>Telefone</strong> — número local + WhatsApp</li>
        <li>✅ <strong>Website</strong> — mesmo que seja um Mini Site simples</li>
      </ul>

      <h2>Como configurar horários corretamente?</h2>
      <ul>
        <li>✅ Horário regular completo (todos os dias da semana)</li>
        <li>✅ Horários especiais para feriados</li>
        <li>✅ Se tem horário de almoço, configure intervalo</li>
        <li>✅ Atualize imediatamente quando houver mudança</li>
      </ul>
      <blockquote>Perfis com horários incorretos recebem avaliações negativas desnecessárias — "fui lá e estava fechado" é evitável.</blockquote>

      <h2>Como escrever a descrição do negócio?</h2>
      <ul>
        <li>✅ Use até 750 caracteres (aproveite todos)</li>
        <li>✅ Inclua palavras-chave naturais</li>
        <li>✅ Destaque diferenciais: anos de experiência, premiações</li>
        <li>✅ Mencione bairro e cidade</li>
      </ul>

      <h2>Quantas fotos e vídeos adicionar?</h2>
      <ul>
        <li>✅ <strong>Logo</strong> em alta qualidade</li>
        <li>✅ <strong>Foto de capa</strong> — a melhor foto do seu espaço</li>
        <li>✅ <strong>Mínimo 10 fotos</strong> — fachada, interior, equipe, serviços</li>
        <li>✅ Fotos <strong>reais e recentes</strong></li>
        <li>✅ Novas fotos pelo menos 1x por mês</li>
      </ul>

      <h2>Como configurar atributos e serviços?</h2>
      <ul>
        <li>✅ Marque todos os atributos disponíveis</li>
        <li>✅ Liste todos os serviços que você oferece</li>
        <li>✅ Adicione preços quando possível</li>
        <li>✅ Para restaurantes: adicione o cardápio diretamente</li>
      </ul>

      <h2>Como gerenciar avaliações?</h2>
      <ul>
        <li>✅ Crie um link curto para avaliação</li>
        <li>✅ Responda 100% das avaliações</li>
        <li>✅ Responda em até 24 horas</li>
        <li>✅ Use o nome do cliente na resposta</li>
      </ul>

      <h2>Como manter posts regulares?</h2>
      <ul>
        <li>✅ Publique de 3 a 4 vezes por semana</li>
        <li>✅ Use imagens em todos os posts</li>
        <li>✅ Inclua CTA: ligar, agendar, saber mais</li>
      </ul>

      <h2>Como o LocalAI automatiza tudo isso?</h2>
      <ul>
        <li><strong>Posts automáticos</strong> — a IA cria e publica com a frequência ideal</li>
        <li><strong>Respostas de avaliações</strong> — inteligentes, rápidas e no tom certo</li>
        <li><strong>Alertas</strong> — avaliação negativa? Notificação na hora</li>
        <li><strong>Otimização de perfil</strong> — sugestões automáticas</li>
        <li><strong>Mini Site</strong> — gerado automaticamente a partir do seu GBP</li>
      </ul>

      <h2>Conclusão</h2>
      <p>Preencher 100% do seu Google Meu Negócio é a ação de marketing com <strong>melhor custo-benefício</strong> que existe. É gratuito, rápido e o impacto é imediato.</p>
      <p>O LocalAI faz isso por +500 negócios locais — no piloto automático.</p>
    </BlogArticleLayout>
  );
}
