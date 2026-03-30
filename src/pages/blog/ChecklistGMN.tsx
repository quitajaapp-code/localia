import BlogArticleLayout from "@/components/blog/BlogArticleLayout";
import heroImage from "@/assets/blog-checklist-gmn-hero.jpg";

export default function ChecklistGMN() {
  return (
    <BlogArticleLayout title="Checklist Completo: Configure seu Google Meu Negócio do Jeito Certo" category="Google Meu Negócio" date="14 de março de 2026">
      <img src={heroImage} alt="Checklist do Google Meu Negócio com itens marcados e mão de IA" width={1920} height={1080} style={{ borderRadius: 12, marginBottom: 32, width: "100%", height: "auto" }} />
      <p>O Google Meu Negócio (agora chamado Google Business Profile) é a ferramenta mais poderosa e gratuita para negócios locais. Mas <strong>a maioria dos donos de negócio preenche menos de 50% do perfil</strong> — e perde clientes para concorrentes que fazem o básico bem feito.</p>
      <p>Use este checklist para garantir que seu perfil está 100% otimizado.</p>

      <h2>Passo 1: Informações básicas</h2>
      <ul>
        <li>✅ <strong>Nome do negócio</strong> — exatamente como aparece na fachada (sem adicionar palavras-chave)</li>
        <li>✅ <strong>Categoria principal</strong> — a mais específica possível (ex: "Clínica de Estética" ao invés de "Clínica")</li>
        <li>✅ <strong>Categorias secundárias</strong> — adicione todas que se aplicam (máximo 9)</li>
        <li>✅ <strong>Endereço</strong> — verificado e idêntico ao de outras plataformas</li>
        <li>✅ <strong>Telefone</strong> — número local, de preferência fixo + WhatsApp</li>
        <li>✅ <strong>Website</strong> — mesmo que seja um Mini Site simples</li>
      </ul>

      <h2>Passo 2: Horários de funcionamento</h2>
      <ul>
        <li>✅ Horário regular completo (todos os dias da semana)</li>
        <li>✅ Horários especiais para feriados</li>
        <li>✅ Se tem horário de almoço, configure intervalo</li>
        <li>✅ Atualize imediatamente quando houver mudança</li>
      </ul>
      <blockquote>Perfis com horários incorretos recebem avaliações negativas desnecessárias — "fui lá e estava fechado" é evitável.</blockquote>

      <h2>Passo 3: Descrição do negócio</h2>
      <ul>
        <li>✅ Use até 750 caracteres (aproveite todos)</li>
        <li>✅ Inclua palavras-chave naturais (ex: "salão de beleza em Curitiba especializado em coloração")</li>
        <li>✅ Destaque diferenciais: anos de experiência, premiações, atendimento especial</li>
        <li>✅ Mencione bairro e cidade</li>
        <li>✅ Não use linguagem promocional exagerada ("o melhor", "imperdível")</li>
      </ul>

      <h2>Passo 4: Fotos e vídeos</h2>
      <ul>
        <li>✅ <strong>Logo</strong> — em alta qualidade, fundo limpo</li>
        <li>✅ <strong>Foto de capa</strong> — a melhor foto do seu espaço ou serviço</li>
        <li>✅ <strong>Mínimo 10 fotos</strong> — fachada, interior, equipe, produtos/serviços</li>
        <li>✅ Fotos <strong>reais e recentes</strong> (nada de banco de imagens)</li>
        <li>✅ Adicione novas fotos pelo menos 1x por mês</li>
        <li>✅ Vídeos curtos (até 30 segundos) do dia a dia</li>
      </ul>

      <h2>Passo 5: Atributos e serviços</h2>
      <ul>
        <li>✅ Marque todos os atributos disponíveis (Wi-Fi, estacionamento, acessibilidade, etc.)</li>
        <li>✅ Liste todos os serviços que você oferece</li>
        <li>✅ Adicione preços quando possível</li>
        <li>✅ Para restaurantes: adicione o cardápio diretamente no perfil</li>
      </ul>

      <h2>Passo 6: Avaliações</h2>
      <ul>
        <li>✅ Crie um link curto para avaliação e compartilhe com clientes</li>
        <li>✅ Responda 100% das avaliações (positivas e negativas)</li>
        <li>✅ Responda em até 24 horas</li>
        <li>✅ Use o nome do cliente na resposta</li>
        <li>✅ Inclua palavras-chave naturais nas respostas</li>
      </ul>

      <h2>Passo 7: Posts regulares</h2>
      <ul>
        <li>✅ Publique de 3 a 4 vezes por semana</li>
        <li>✅ Use imagens em todos os posts</li>
        <li>✅ Tipos de post: novidade, oferta, evento, atualização</li>
        <li>✅ Inclua CTA (botão de ação): ligar, agendar, saber mais</li>
      </ul>

      <h2>Passo 8: Perguntas e Respostas (Q&A)</h2>
      <ul>
        <li>✅ Crie e responda suas próprias perguntas frequentes</li>
        <li>✅ Monitore perguntas de clientes e responda rapidamente</li>
        <li>✅ Use palavras-chave nas perguntas e respostas</li>
      </ul>

      <h2>Como o LocalAI ajuda com tudo isso?</h2>
      <p>Configurar tudo manualmente é possível — mas leva tempo e exige constância. O LocalAI automatiza as partes mais trabalhosas:</p>
      <ul>
        <li><strong>Posts automáticos</strong> — a IA cria e publica com a frequência ideal</li>
        <li><strong>Respostas de avaliações</strong> — inteligentes, rápidas e no tom certo</li>
        <li><strong>Alertas</strong> — avaliação negativa? Você é notificado na hora</li>
        <li><strong>Otimização de perfil</strong> — sugestões automáticas para melhorar campos</li>
        <li><strong>Mini Site</strong> — gerado automaticamente a partir do seu GBP</li>
      </ul>

      <h2>Conclusão</h2>
      <p>Preencher 100% do seu Google Meu Negócio é a ação de marketing com <strong>melhor custo-benefício</strong> que existe para negócios locais. É gratuito, rápido e o impacto é imediato.</p>
      <p>Se você quer ir além e automatizar a manutenção do perfil, o LocalAI faz isso por você — no piloto automático.</p>
    </BlogArticleLayout>
  );
}
