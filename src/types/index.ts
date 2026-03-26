export interface Profile {
  id: string;
  user_id: string;
  nome: string | null;
  email: string | null;
  stripe_customer_id: string | null;
  plano: string;
  trial_ends_at: string | null;
  notif_settings: Record<string, unknown>;
  created_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  nome: string;
  nicho: string | null;
  tom_de_voz: string;
  gmb_location_id: string | null;
  ads_customer_id: string | null;
  website_url: string | null;
  whatsapp: string | null;
  cidade: string | null;
  estado: string | null;
  score_materiais: number;
  config_posts: Record<string, unknown>;
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  review_id_google: string | null;
  autor: string | null;
  rating: number | null;
  texto: string | null;
  resposta_sugerida_ia: string | null;
  respondido: boolean;
  respondido_em: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  business_id: string;
  texto: string | null;
  imagem_url: string | null;
  tipo: string | null;
  status: string;
  agendado_para: string | null;
  publicado_em: string | null;
  gmb_post_id: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  nome: string;
  tipo: string;
  status: string;
  verba_mensal: number;
  verba_restante: number;
  ads_campaign_id: string | null;
  created_at: string;
}

export interface Material {
  id: string;
  business_id: string;
  tipo: string;
  url: string | null;
  nome: string | null;
  status: string;
  created_at: string;
}
