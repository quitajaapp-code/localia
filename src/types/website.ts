export interface WebsiteService {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  icone: string;
}

export interface WebsiteGaleriaItem {
  id: string;
  url: string;
  caption: string;
}

export interface WebsiteDepoimento {
  id: string;
  nome: string;
  texto: string;
  rating: number;
  foto_url?: string;
}

export interface WebsiteHorario {
  dia: string;
  abre: string;
  fecha: string;
  fechado: boolean;
}

export interface WebsiteConfig {
  logo_url?: string;
  hero: {
    titulo: string;
    subtitulo: string;
    cta_texto: string;
    cta_link: string;
    bg_image_url: string;
  };
  sobre: {
    texto: string;
    foto_url: string;
  };
  servicos: WebsiteService[];
  galeria: WebsiteGaleriaItem[];
  contato: {
    telefone: string;
    whatsapp: string;
    email: string;
    endereco: string;
    maps_url: string;
    maps_place_id?: string;
  };
  redes: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    linkedin: string;
  };
  horarios: WebsiteHorario[];
  depoimentos: WebsiteDepoimento[];
  cta_flutuante: {
    tipo: 'whatsapp' | 'telefone' | 'nenhum';
    valor: string;
  };
}

export interface Website {
  id: string;
  business_id: string;
  user_id: string;
  slug: string;
  custom_domain?: string | null;
  published: boolean;
  published_at?: string | null;
  theme: 'dark' | 'light' | 'brand';
  primary_color: string;
  config: WebsiteConfig;
  seo_titulo?: string | null;
  seo_descricao?: string | null;
  seo_og_image?: string | null;
  total_visitas: number;
  visitas_semana: number;
  created_at: string;
  updated_at: string;
}

export const defaultWebsiteConfig: WebsiteConfig = {
  hero: {
    titulo: "Bem-vindo ao nosso negócio",
    subtitulo: "Qualidade e atendimento que você merece",
    cta_texto: "Falar no WhatsApp",
    cta_link: "",
    bg_image_url: "",
  },
  sobre: { texto: "", foto_url: "" },
  servicos: [],
  galeria: [],
  contato: { telefone: "", whatsapp: "", email: "", endereco: "", maps_url: "", maps_place_id: "" },
  redes: { instagram: "", facebook: "", tiktok: "", youtube: "", linkedin: "" },
  horarios: [
    { dia: "Segunda", abre: "08:00", fecha: "18:00", fechado: false },
    { dia: "Terça", abre: "08:00", fecha: "18:00", fechado: false },
    { dia: "Quarta", abre: "08:00", fecha: "18:00", fechado: false },
    { dia: "Quinta", abre: "08:00", fecha: "18:00", fechado: false },
    { dia: "Sexta", abre: "08:00", fecha: "18:00", fechado: false },
    { dia: "Sábado", abre: "09:00", fecha: "13:00", fechado: false },
    { dia: "Domingo", abre: "", fecha: "", fechado: true },
  ],
  depoimentos: [],
  cta_flutuante: { tipo: 'whatsapp', valor: "" },
};
