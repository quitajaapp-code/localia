export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          ads_ad_id: string | null
          campaign_id: string
          cliques: number | null
          cpc: number | null
          created_at: string | null
          ctr: number | null
          descriptions: Json | null
          headlines: Json | null
          id: string
          impressoes: number | null
          status: string | null
        }
        Insert: {
          ads_ad_id?: string | null
          campaign_id: string
          cliques?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr?: number | null
          descriptions?: Json | null
          headlines?: Json | null
          id?: string
          impressoes?: number | null
          status?: string | null
        }
        Update: {
          ads_ad_id?: string | null
          campaign_id?: string
          cliques?: number | null
          cpc?: number | null
          created_at?: string | null
          ctr?: number | null
          descriptions?: Json | null
          headlines?: Json | null
          id?: string
          impressoes?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads_metrics: {
        Row: {
          business_id: string
          cliques: number | null
          conversoes: number | null
          cpc_medio: number | null
          created_at: string | null
          ctr: number | null
          gasto_total: number | null
          id: string
          impressoes: number | null
          semana_ref: string | null
        }
        Insert: {
          business_id: string
          cliques?: number | null
          conversoes?: number | null
          cpc_medio?: number | null
          created_at?: string | null
          ctr?: number | null
          gasto_total?: number | null
          id?: string
          impressoes?: number | null
          semana_ref?: string | null
        }
        Update: {
          business_id?: string
          cliques?: number | null
          conversoes?: number | null
          cpc_medio?: number | null
          created_at?: string | null
          ctr?: number | null
          gasto_total?: number | null
          id?: string
          impressoes?: number | null
          semana_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          ads_customer_id: string | null
          anos_experiencia: string | null
          cidade: string | null
          config_posts: Json | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          depoimentos: string | null
          diferenciais: string | null
          estado: string | null
          faq: string | null
          gmb_location_id: string | null
          ia_api_key: string | null
          ia_nunca_mencionar: string | null
          ia_provider: string | null
          ia_sempre_mencionar: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          nicho: string | null
          nome: string
          num_clientes: string | null
          outras_redes: string | null
          premios: string | null
          produtos: string | null
          promocoes: string | null
          publico_alvo: string | null
          score_materiais: number | null
          tom_de_voz: string | null
          user_id: string
          video_url: string | null
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          ads_customer_id?: string | null
          anos_experiencia?: string | null
          cidade?: string | null
          config_posts?: Json | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          depoimentos?: string | null
          diferenciais?: string | null
          estado?: string | null
          faq?: string | null
          gmb_location_id?: string | null
          ia_api_key?: string | null
          ia_nunca_mencionar?: string | null
          ia_provider?: string | null
          ia_sempre_mencionar?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nicho?: string | null
          nome: string
          num_clientes?: string | null
          outras_redes?: string | null
          premios?: string | null
          produtos?: string | null
          promocoes?: string | null
          publico_alvo?: string | null
          score_materiais?: number | null
          tom_de_voz?: string | null
          user_id: string
          video_url?: string | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          ads_customer_id?: string | null
          anos_experiencia?: string | null
          cidade?: string | null
          config_posts?: Json | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          depoimentos?: string | null
          diferenciais?: string | null
          estado?: string | null
          faq?: string | null
          gmb_location_id?: string | null
          ia_api_key?: string | null
          ia_nunca_mencionar?: string | null
          ia_provider?: string | null
          ia_sempre_mencionar?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nicho?: string | null
          nome?: string
          num_clientes?: string | null
          outras_redes?: string | null
          premios?: string | null
          produtos?: string | null
          promocoes?: string | null
          publico_alvo?: string | null
          score_materiais?: number | null
          tom_de_voz?: string | null
          user_id?: string
          video_url?: string | null
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          ads_campaign_id: string | null
          business_id: string
          created_at: string | null
          id: string
          nome: string
          status: string | null
          tipo: string | null
          verba_mensal: number | null
          verba_restante: number | null
        }
        Insert: {
          ads_campaign_id?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          nome: string
          status?: string | null
          tipo?: string | null
          verba_mensal?: number | null
          verba_restante?: number | null
        }
        Update: {
          ads_campaign_id?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          nome?: string
          status?: string | null
          tipo?: string | null
          verba_mensal?: number | null
          verba_restante?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gmb_metrics: {
        Row: {
          business_id: string
          cliques_site: number | null
          created_at: string | null
          fotos_views: number | null
          id: string
          ligacoes: number | null
          rotas: number | null
          semana_ref: string | null
          views_busca: number | null
          views_maps: number | null
        }
        Insert: {
          business_id: string
          cliques_site?: number | null
          created_at?: string | null
          fotos_views?: number | null
          id?: string
          ligacoes?: number | null
          rotas?: number | null
          semana_ref?: string | null
          views_busca?: number | null
          views_maps?: number | null
        }
        Update: {
          business_id?: string
          cliques_site?: number | null
          created_at?: string | null
          fotos_views?: number | null
          id?: string
          ligacoes?: number | null
          rotas?: number | null
          semana_ref?: string | null
          views_busca?: number | null
          views_maps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gmb_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gmb_snapshots: {
        Row: {
          business_id: string
          created_at: string | null
          dados_json: Json | null
          id: string
          synced_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          dados_json?: Json | null
          id?: string
          synced_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          dados_json?: Json | null
          id?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmb_snapshots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      keywords: {
        Row: {
          campaign_id: string
          cliques: number | null
          conversoes: number | null
          cpc_atual: number | null
          created_at: string | null
          id: string
          impressoes: number | null
          match_type: string | null
          status: string | null
          termo: string
        }
        Insert: {
          campaign_id: string
          cliques?: number | null
          conversoes?: number | null
          cpc_atual?: number | null
          created_at?: string | null
          id?: string
          impressoes?: number | null
          match_type?: string | null
          status?: string | null
          termo: string
        }
        Update: {
          campaign_id?: string
          cliques?: number | null
          conversoes?: number | null
          cpc_atual?: number | null
          created_at?: string | null
          id?: string
          impressoes?: number | null
          match_type?: string | null
          status?: string | null
          termo?: string
        }
        Relationships: [
          {
            foreignKeyName: "keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          nome: string | null
          status: string | null
          tipo: string
          url: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          nome?: string | null
          status?: string | null
          tipo: string
          url?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          nome?: string | null
          status?: string | null
          tipo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      negative_keywords: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          match_type: string | null
          termo: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          match_type?: string | null
          termo: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          match_type?: string | null
          termo?: string
        }
        Relationships: [
          {
            foreignKeyName: "negative_keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_tokens: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          google_email: string | null
          id: string
          provider: string
          refresh_token: string | null
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          google_email?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          google_email?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          agendado_para: string | null
          business_id: string
          created_at: string | null
          gmb_post_id: string | null
          id: string
          imagem_url: string | null
          publicado_em: string | null
          status: string | null
          texto: string | null
          tipo: string | null
        }
        Insert: {
          agendado_para?: string | null
          business_id: string
          created_at?: string | null
          gmb_post_id?: string | null
          id?: string
          imagem_url?: string | null
          publicado_em?: string | null
          status?: string | null
          texto?: string | null
          tipo?: string | null
        }
        Update: {
          agendado_para?: string | null
          business_id?: string
          created_at?: string | null
          gmb_post_id?: string | null
          id?: string
          imagem_url?: string | null
          publicado_em?: string | null
          status?: string | null
          texto?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          notif_settings: Json | null
          plano: string | null
          stripe_customer_id: string | null
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          notif_settings?: Json | null
          plano?: string | null
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          notif_settings?: Json | null
          plano?: string | null
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          autor: string | null
          business_id: string
          created_at: string | null
          data_review: string | null
          id: string
          rating: number | null
          respondido: boolean | null
          respondido_em: string | null
          resposta_sugerida_ia: string | null
          review_id_google: string | null
          texto: string | null
        }
        Insert: {
          autor?: string | null
          business_id: string
          created_at?: string | null
          data_review?: string | null
          id?: string
          rating?: number | null
          respondido?: boolean | null
          respondido_em?: string | null
          resposta_sugerida_ia?: string | null
          review_id_google?: string | null
          texto?: string | null
        }
        Update: {
          autor?: string | null
          business_id?: string
          created_at?: string | null
          data_review?: string | null
          id?: string
          rating?: number | null
          respondido?: boolean | null
          respondido_em?: string | null
          resposta_sugerida_ia?: string | null
          review_id_google?: string | null
          texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      website_visits: {
        Row: {
          id: string
          referrer: string | null
          user_agent: string | null
          visited_at: string | null
          website_id: string | null
        }
        Insert: {
          id?: string
          referrer?: string | null
          user_agent?: string | null
          visited_at?: string | null
          website_id?: string | null
        }
        Update: {
          id?: string
          referrer?: string | null
          user_agent?: string | null
          visited_at?: string | null
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_visits_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          business_id: string | null
          config: Json | null
          created_at: string | null
          custom_domain: string | null
          id: string
          primary_color: string | null
          published: boolean | null
          published_at: string | null
          seo_descricao: string | null
          seo_og_image: string | null
          seo_titulo: string | null
          slug: string
          theme: string | null
          total_visitas: number | null
          updated_at: string | null
          user_id: string | null
          visitas_semana: number | null
        }
        Insert: {
          business_id?: string | null
          config?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          primary_color?: string | null
          published?: boolean | null
          published_at?: string | null
          seo_descricao?: string | null
          seo_og_image?: string | null
          seo_titulo?: string | null
          slug: string
          theme?: string | null
          total_visitas?: number | null
          updated_at?: string | null
          user_id?: string | null
          visitas_semana?: number | null
        }
        Update: {
          business_id?: string | null
          config?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          primary_color?: string | null
          published?: boolean | null
          published_at?: string | null
          seo_descricao?: string | null
          seo_og_image?: string | null
          seo_titulo?: string | null
          slug?: string
          theme?: string | null
          total_visitas?: number | null
          updated_at?: string | null
          user_id?: string | null
          visitas_semana?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "websites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
