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
      action_executions: {
        Row: {
          action_id: string
          created_at: string | null
          executed_at: string | null
          id: string
          lead_id: string
          resultado: Json | null
          status: string
        }
        Insert: {
          action_id: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          lead_id: string
          resultado?: Json | null
          status?: string
        }
        Update: {
          action_id?: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          lead_id?: string
          resultado?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_executions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "stage_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_executions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_accounts: {
        Row: {
          access_token_encrypted: string | null
          created_at: string | null
          expires_at: string | null
          google_ads_customer_id: string | null
          id: string
          refresh_token_encrypted: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          expires_at?: string | null
          google_ads_customer_id?: string | null
          id?: string
          refresh_token_encrypted?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          expires_at?: string | null
          google_ads_customer_id?: string | null
          id?: string
          refresh_token_encrypted?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ad_campaigns: {
        Row: {
          ad_account_id: string | null
          budget_daily: number | null
          business_name: string
          city: string | null
          created_at: string | null
          google_campaign_id: string | null
          id: string
          niche: string | null
          performance_score: number | null
          status: string | null
          strategy_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_account_id?: string | null
          budget_daily?: number | null
          business_name: string
          city?: string | null
          created_at?: string | null
          google_campaign_id?: string | null
          id?: string
          niche?: string | null
          performance_score?: number | null
          status?: string | null
          strategy_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_account_id?: string | null
          budget_daily?: number | null
          business_name?: string
          city?: string | null
          created_at?: string | null
          google_campaign_id?: string | null
          id?: string
          niche?: string | null
          performance_score?: number | null
          status?: string | null
          strategy_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          campaign_id: string
          created_at: string | null
          description: string | null
          google_ad_id: string | null
          headline1: string | null
          headline2: string | null
          headline3: string | null
          id: string
          performance_score: number | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          description?: string | null
          google_ad_id?: string | null
          headline1?: string | null
          headline2?: string | null
          headline3?: string | null
          id?: string
          performance_score?: number | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          description?: string | null
          google_ad_id?: string | null
          headline1?: string | null
          headline2?: string | null
          headline3?: string | null
          id?: string
          performance_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_keywords: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          is_negative: boolean | null
          keyword: string
          match_type: string | null
          performance_score: number | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          is_negative?: boolean | null
          keyword: string
          match_type?: string | null
          performance_score?: number | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          is_negative?: boolean | null
          keyword?: string
          match_type?: string | null
          performance_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_keywords_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_logs: {
        Row: {
          action: string
          agent: string | null
          campaign_id: string
          created_at: string | null
          id: string
          payload: Json | null
          performance_score: number | null
        }
        Insert: {
          action: string
          agent?: string | null
          campaign_id: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          performance_score?: number | null
        }
        Update: {
          action?: string
          agent?: string | null
          campaign_id?: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          performance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_metrics: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cost: number | null
          created_at: string | null
          ctr: number | null
          id: string
          impressions: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          ctr?: number | null
          id?: string
          impressions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          ads_ad_id: string | null
          campaign_id: string
          cliques: number | null
          cpc: number | null
          created_at: string | null
          ctr: number | null
          description_text: string | null
          descriptions: Json | null
          headline1: string | null
          headline2: string | null
          headline3: string | null
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
          description_text?: string | null
          descriptions?: Json | null
          headline1?: string | null
          headline2?: string | null
          headline3?: string | null
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
          description_text?: string | null
          descriptions?: Json | null
          headline1?: string | null
          headline2?: string | null
          headline3?: string | null
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
      agent_actions: {
        Row: {
          action_type: string
          agent: string
          applied_at: string | null
          auto_applied: boolean | null
          business_id: string | null
          created_at: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string
        }
        Insert: {
          action_type: string
          agent: string
          applied_at?: string | null
          auto_applied?: boolean | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
        }
        Update: {
          action_type?: string
          agent?: string
          applied_at?: string | null
          auto_applied?: boolean | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_alerts: {
        Row: {
          agent: string
          alert_type: string
          business_id: string
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          notified_email: boolean
          notified_whatsapp: boolean
          read: boolean
          review_id: string | null
          severity: string
          title: string
        }
        Insert: {
          agent?: string
          alert_type: string
          business_id: string
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          notified_email?: boolean
          notified_whatsapp?: boolean
          read?: boolean
          review_id?: string | null
          severity?: string
          title: string
        }
        Update: {
          agent?: string
          alert_type?: string
          business_id?: string
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          notified_email?: boolean
          notified_whatsapp?: boolean
          read?: boolean
          review_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_alerts_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_settings: {
        Row: {
          ads_auto_adjust: boolean | null
          ads_cron: string | null
          business_id: string | null
          created_at: string | null
          id: string
          posts_auto_publish: boolean | null
          posts_best_time: string | null
          posts_cron: string | null
          posts_frequency: string | null
          profile_auto_optimize: boolean | null
          profile_cron: string | null
          reviews_auto_reply: boolean | null
          reviews_auto_threshold: number | null
          reviews_cron: string | null
          updated_at: string | null
        }
        Insert: {
          ads_auto_adjust?: boolean | null
          ads_cron?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          posts_auto_publish?: boolean | null
          posts_best_time?: string | null
          posts_cron?: string | null
          posts_frequency?: string | null
          profile_auto_optimize?: boolean | null
          profile_cron?: string | null
          reviews_auto_reply?: boolean | null
          reviews_auto_threshold?: number | null
          reviews_cron?: string | null
          updated_at?: string | null
        }
        Update: {
          ads_auto_adjust?: boolean | null
          ads_cron?: string | null
          business_id?: string | null
          created_at?: string | null
          id?: string
          posts_auto_publish?: boolean | null
          posts_best_time?: string | null
          posts_cron?: string | null
          posts_frequency?: string | null
          profile_auto_optimize?: boolean | null
          profile_cron?: string | null
          reviews_auto_reply?: boolean | null
          reviews_auto_threshold?: number | null
          reviews_cron?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
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
          ad_account_id: string | null
          ads_campaign_id: string | null
          budget_daily: number | null
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
          ad_account_id?: string | null
          ads_campaign_id?: string | null
          budget_daily?: number | null
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
          ad_account_id?: string | null
          ads_campaign_id?: string | null
          budget_daily?: number | null
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
            foreignKeyName: "campaigns_ad_account_id_fkey"
            columns: ["ad_account_id"]
            isOneToOne: false
            referencedRelation: "ad_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_agent: string | null
          canal: string
          contact_identifier: string | null
          contact_name: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          assigned_agent?: string | null
          canal?: string
          contact_identifier?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          assigned_agent?: string | null
          canal?: string
          contact_identifier?: string | null
          contact_name?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          discount_percent: number
          id: string
          max_uses: number | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_percent?: number
          id?: string
          max_uses?: number | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_percent?: number
          id?: string
          max_uses?: number | null
          valid_until?: string | null
        }
        Relationships: []
      }
      funnels: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
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
      leads: {
        Row: {
          cidade: string | null
          created_at: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          id: string
          nicho: string | null
          nome: string
          notas: string | null
          pipeline_order: number | null
          pipeline_stage: string | null
          proximo_followup: string | null
          score: number | null
          source: string | null
          tags: string[] | null
          telefone: string | null
          ultimo_contato: string | null
          updated_at: string | null
          valor_estimado: number | null
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          id?: string
          nicho?: string | null
          nome: string
          notas?: string | null
          pipeline_order?: number | null
          pipeline_stage?: string | null
          proximo_followup?: string | null
          score?: number | null
          source?: string | null
          tags?: string[] | null
          telefone?: string | null
          ultimo_contato?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          id?: string
          nicho?: string | null
          nome?: string
          notas?: string | null
          pipeline_order?: number | null
          pipeline_stage?: string | null
          proximo_followup?: string | null
          score?: number | null
          source?: string | null
          tags?: string[] | null
          telefone?: string | null
          ultimo_contato?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_pipeline_stage_fkey"
            columns: ["pipeline_stage"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["slug"]
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
          access_token_encrypted: string | null
          created_at: string | null
          expires_at: string | null
          google_email: string | null
          id: string
          provider: string
          refresh_token_encrypted: string | null
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string | null
          expires_at?: string | null
          google_email?: string | null
          id?: string
          provider: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string | null
          expires_at?: string | null
          google_email?: string | null
          id?: string
          provider?: string
          refresh_token_encrypted?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      optimizer_cache: {
        Row: {
          business_id: string
          created_at: string
          id: string
          report_json: Json
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          report_json?: Json
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          report_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          cor: string | null
          created_at: string | null
          funnel_id: string | null
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          cor?: string | null
          created_at?: string | null
          funnel_id?: string | null
          id?: string
          nome: string
          ordem: number
          slug: string
        }
        Update: {
          cor?: string | null
          created_at?: string | null
          funnel_id?: string | null
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
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
      stage_actions: {
        Row: {
          ativo: boolean
          config: Json
          created_at: string | null
          delay_minutos: number | null
          id: string
          ordem: number
          stage_id: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          config?: Json
          created_at?: string | null
          delay_minutos?: number | null
          id?: string
          ordem?: number
          stage_id: string
          tipo?: string
        }
        Update: {
          ativo?: boolean
          config?: Json
          created_at?: string | null
          delay_minutos?: number | null
          id?: string
          ordem?: number
          stage_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_actions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      template_usage: {
        Row: {
          canal: string
          entregue: boolean | null
          enviado_em: string
          erro: string | null
          id: string
          lead_id: string | null
          respondido: boolean | null
          respondido_em: string | null
          template_id: string
        }
        Insert: {
          canal?: string
          entregue?: boolean | null
          enviado_em?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          respondido?: boolean | null
          respondido_em?: string | null
          template_id: string
        }
        Update: {
          canal?: string
          entregue?: boolean | null
          enviado_em?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          respondido?: boolean | null
          respondido_em?: string | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_usage_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_usage_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      whatsapp_connections: {
        Row: {
          business_id: string
          created_at: string
          id: string
          last_sync_at: string | null
          meta_business_id: string | null
          status: Database["public"]["Enums"]["whatsapp_connection_status"]
          twilio_account_sid: string | null
          twilio_phone_number: string | null
          twilio_webhook_url: string | null
          updated_at: string
          user_id: string
          whatsapp_business_account_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          meta_business_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_connection_status"]
          twilio_account_sid?: string | null
          twilio_phone_number?: string | null
          twilio_webhook_url?: string | null
          updated_at?: string
          user_id: string
          whatsapp_business_account_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          meta_business_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_connection_status"]
          twilio_account_sid?: string | null
          twilio_phone_number?: string | null
          twilio_webhook_url?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_business_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          business_id: string
          connection_id: string
          content: string | null
          created_at: string
          delivered_at: string | null
          direction: Database["public"]["Enums"]["whatsapp_direction"]
          error_message: string | null
          from_number: string | null
          id: string
          media_urls: string[] | null
          message_type: Database["public"]["Enums"]["whatsapp_message_type"]
          meta_message_id: string | null
          metadata: Json | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["whatsapp_message_status"]
          to_number: string | null
          twilio_sid: string | null
        }
        Insert: {
          business_id: string
          connection_id: string
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          direction: Database["public"]["Enums"]["whatsapp_direction"]
          error_message?: string | null
          from_number?: string | null
          id?: string
          media_urls?: string[] | null
          message_type?: Database["public"]["Enums"]["whatsapp_message_type"]
          meta_message_id?: string | null
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          to_number?: string | null
          twilio_sid?: string | null
        }
        Update: {
          business_id?: string
          connection_id?: string
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["whatsapp_direction"]
          error_message?: string | null
          from_number?: string | null
          id?: string
          media_urls?: string[] | null
          message_type?: Database["public"]["Enums"]["whatsapp_message_type"]
          meta_message_id?: string | null
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["whatsapp_message_status"]
          to_number?: string | null
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_meta_templates: {
        Row: {
          body_content: string
          business_id: string
          category: string
          created_at: string
          footer_content: string | null
          header_content: string | null
          header_type: string | null
          id: string
          language: string
          meta_template_id: string | null
          name: string
          status: Database["public"]["Enums"]["whatsapp_template_status"]
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_content: string
          business_id: string
          category?: string
          created_at?: string
          footer_content?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string
          meta_template_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["whatsapp_template_status"]
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_content?: string
          business_id?: string
          category?: string
          created_at?: string
          footer_content?: string | null
          header_content?: string | null
          header_type?: string | null
          id?: string
          language?: string
          meta_template_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["whatsapp_template_status"]
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_meta_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string | null
          id: string
          mensagem: string
          nome: string
          updated_at: string | null
          variaveis: string[] | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string | null
          id?: string
          mensagem: string
          nome: string
          updated_at?: string | null
          variaveis?: string[] | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string | null
          id?: string
          mensagem?: string
          nome?: string
          updated_at?: string | null
          variaveis?: string[] | null
        }
        Relationships: []
      }
      whatsapp_webhook_logs: {
        Row: {
          body: Json | null
          connection_id: string | null
          created_at: string
          error_message: string | null
          headers: Json | null
          id: string
          method: string | null
          processed: boolean
          response_body: Json | null
          response_status: number | null
          url: string | null
        }
        Insert: {
          body?: Json | null
          connection_id?: string | null
          created_at?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          method?: string | null
          processed?: boolean
          response_body?: Json | null
          response_status?: number | null
          url?: string | null
        }
        Update: {
          body?: Json | null
          connection_id?: string | null
          created_at?: string
          error_message?: string | null
          headers?: Json | null
          id?: string
          method?: string | null
          processed?: boolean
          response_body?: Json | null
          response_status?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_webhook_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          ativo: boolean
          created_at: string | null
          descricao: string | null
          edges: Json
          funnel_id: string | null
          id: string
          nodes: Json
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          edges?: Json
          funnel_id?: string | null
          id?: string
          nodes?: Json
          nome?: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          descricao?: string | null
          edges?: Json
          funnel_id?: string | null
          id?: string
          nodes?: Json
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "funnels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      orchestration_history: {
        Row: {
          agents_run: Json | null
          agents_triggered: Json | null
          business_id: string | null
          business_nome: string | null
          business_state: Json | null
          cidade: string | null
          created_at: string | null
          estado: string | null
          id: string | null
          nicho: string | null
          results_summary: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_agent_cron_job: {
        Args: {
          p_anon_key: string
          p_body: string
          p_function_url: string
          p_job_name: string
          p_schedule: string
        }
        Returns: undefined
      }
      decrypt_token: {
        Args: { encrypted_data: string; secret_key: string }
        Returns: string
      }
      encrypt_token: {
        Args: { plain_text: string; secret_key: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      remove_agent_cron_job: {
        Args: { p_job_name: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      whatsapp_connection_status:
        | "pending"
        | "active"
        | "suspended"
        | "disconnected"
      whatsapp_direction: "inbound" | "outbound"
      whatsapp_message_status:
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
      whatsapp_message_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "document"
        | "template"
        | "location"
        | "contact"
      whatsapp_template_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      whatsapp_connection_status: [
        "pending",
        "active",
        "suspended",
        "disconnected",
      ],
      whatsapp_direction: ["inbound", "outbound"],
      whatsapp_message_status: [
        "queued",
        "sent",
        "delivered",
        "read",
        "failed",
      ],
      whatsapp_message_type: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "template",
        "location",
        "contact",
      ],
      whatsapp_template_status: ["pending", "approved", "rejected"],
    },
  },
} as const
