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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          accessed_at: string | null
          code_id: string | null
          id: string
          ip_address: unknown
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string | null
          code_id?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string | null
          code_id?: string | null
          id?: string
          ip_address?: unknown
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_tasks: {
        Row: {
          code: string
          created_at: string | null
          day_end: number
          day_start: number
          id: string
          phase: number
          phase_name: string
          progress: number
          responsible: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          day_end?: number
          day_start?: number
          id?: string
          phase?: number
          phase_name: string
          progress?: number
          responsible?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          day_end?: number
          day_start?: number
          id?: string
          phase?: number
          phase_name?: string
          progress?: number
          responsible?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      activity_stats: {
        Row: {
          created_at: string | null
          date: string
          deployments: number
          id: string
          messages: number
          requests: number
        }
        Insert: {
          created_at?: string | null
          date: string
          deployments?: number
          id?: string
          messages?: number
          requests?: number
        }
        Update: {
          created_at?: string | null
          date?: string
          deployments?: number
          id?: string
          messages?: number
          requests?: number
        }
        Relationships: []
      }
      ad_campaigns: {
        Row: {
          budget_daily: number | null
          clicks: number | null
          conversions: number | null
          cost_per_lead: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          ctr: number | null
          date_since: string | null
          date_until: string | null
          external_id: string
          id: string
          impressions: number | null
          leads_count: number | null
          name: string
          objective: string | null
          platform: string
          portal_client_id: string | null
          reach: number | null
          revenue: number | null
          roi: number | null
          spend: number | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          budget_daily?: number | null
          clicks?: number | null
          conversions?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date_since?: string | null
          date_until?: string | null
          external_id: string
          id?: string
          impressions?: number | null
          leads_count?: number | null
          name: string
          objective?: string | null
          platform: string
          portal_client_id?: string | null
          reach?: number | null
          revenue?: number | null
          roi?: number | null
          spend?: number | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_daily?: number | null
          clicks?: number | null
          conversions?: number | null
          cost_per_lead?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date_since?: string | null
          date_until?: string | null
          external_id?: string
          id?: string
          impressions?: number | null
          leads_count?: number | null
          name?: string
          objective?: string | null
          platform?: string
          portal_client_id?: string | null
          reach?: number | null
          revenue?: number | null
          roi?: number | null
          spend?: number | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_portal_client_id_fkey"
            columns: ["portal_client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_channels: {
        Row: {
          agent_id: string
          channel_type: string
          config: Json
          created_at: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          channel_type: string
          config?: Json
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          channel_type?: string
          config?: Json
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_channels_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_config"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_executions: {
        Row: {
          agent_id: string
          context: Json | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          execution_id: string
          id: string
          input_data: string | null
          output_data: Json | null
          skills_executed: Json | null
          status: string | null
          total_cost: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          context?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id: string
          id?: string
          input_data?: string | null
          output_data?: Json | null
          skills_executed?: Json | null
          status?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          context?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_id?: string
          id?: string
          input_data?: string | null
          output_data?: Json | null
          skills_executed?: Json | null
          status?: string | null
          total_cost?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_config"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      agent_interactions: {
        Row: {
          agent_name: string
          created_at: string | null
          date: string
          id: string
          interactions: number
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          date?: string
          id?: string
          interactions?: number
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          date?: string
          id?: string
          interactions?: number
        }
        Relationships: []
      }
      agent_knowledge_access: {
        Row: {
          access_level: string | null
          agent_id: string
          created_at: string | null
          document_id: string
          id: string
        }
        Insert: {
          access_level?: string | null
          agent_id: string
          created_at?: string | null
          document_id: string
          id?: string
        }
        Update: {
          access_level?: string | null
          agent_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_access_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_config"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_skills_config: {
        Row: {
          agent_id: string
          created_at: string | null
          custom_config: Json | null
          id: string
          is_enabled: boolean | null
          position: number
          skill_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_enabled?: boolean | null
          position: number
          skill_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_enabled?: boolean | null
          position?: number
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_skills_config_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents_config"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          agent_group: string | null
          category: string | null
          created_at: string | null
          daily_tasks: number | null
          description: string | null
          emoji: string | null
          id: string
          is_orchestrator: boolean | null
          name: string
          role: string
          slug: string | null
          status: string
          success_rate: number | null
          tasks: number
        }
        Insert: {
          agent_group?: string | null
          category?: string | null
          created_at?: string | null
          daily_tasks?: number | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_orchestrator?: boolean | null
          name: string
          role: string
          slug?: string | null
          status?: string
          success_rate?: number | null
          tasks?: number
        }
        Update: {
          agent_group?: string | null
          category?: string | null
          created_at?: string | null
          daily_tasks?: number | null
          description?: string | null
          emoji?: string | null
          id?: string
          is_orchestrator?: boolean | null
          name?: string
          role?: string
          slug?: string | null
          status?: string
          success_rate?: number | null
          tasks?: number
        }
        Relationships: []
      }
      agents_config: {
        Row: {
          adjectives: string[] | null
          agent_id: string
          bio: string
          created_at: string | null
          emoji: string | null
          exported_character: Json | null
          id: string
          knowledge_enabled: boolean | null
          knowledge_sources: string[] | null
          lore: string | null
          max_tokens: number | null
          metadata: Json | null
          model_override: string | null
          name: string
          plugins: string[] | null
          rag_mode: string | null
          skills: Json | null
          status: string | null
          system_prompt: string
          system_prompt_variations: string[] | null
          temperature: number | null
          tier: number | null
          updated_at: string | null
        }
        Insert: {
          adjectives?: string[] | null
          agent_id: string
          bio?: string
          created_at?: string | null
          emoji?: string | null
          exported_character?: Json | null
          id?: string
          knowledge_enabled?: boolean | null
          knowledge_sources?: string[] | null
          lore?: string | null
          max_tokens?: number | null
          metadata?: Json | null
          model_override?: string | null
          name: string
          plugins?: string[] | null
          rag_mode?: string | null
          skills?: Json | null
          status?: string | null
          system_prompt?: string
          system_prompt_variations?: string[] | null
          temperature?: number | null
          tier?: number | null
          updated_at?: string | null
        }
        Update: {
          adjectives?: string[] | null
          agent_id?: string
          bio?: string
          created_at?: string | null
          emoji?: string | null
          exported_character?: Json | null
          id?: string
          knowledge_enabled?: boolean | null
          knowledge_sources?: string[] | null
          lore?: string | null
          max_tokens?: number | null
          metadata?: Json | null
          model_override?: string | null
          name?: string
          plugins?: string[] | null
          rag_mode?: string | null
          skills?: Json | null
          status?: string | null
          system_prompt?: string
          system_prompt_variations?: string[] | null
          temperature?: number | null
          tier?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alexandria_documents: {
        Row: {
          content: string
          created_at: string | null
          doc_type: string
          embedding: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          path: string | null
          source_id: string | null
          source_path: string | null
          source_type: string
          sync_enabled: boolean
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          doc_type: string
          embedding?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          path?: string | null
          source_id?: string | null
          source_path?: string | null
          source_type?: string
          sync_enabled?: boolean
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          doc_type?: string
          embedding?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          path?: string | null
          source_id?: string | null
          source_path?: string | null
          source_type?: string
          sync_enabled?: boolean
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      alexandria_sync_log: {
        Row: {
          created_at: string | null
          document_id: string | null
          error_message: string | null
          id: string
          source_path: string | null
          source_type: string
          status: string
          synced_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          source_path?: string | null
          source_type: string
          status: string
          synced_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          source_path?: string | null
          source_type?: string
          status?: string
          synced_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alexandria_sync_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "alexandria_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          created_at: string | null
          id: string
          message: string
          model_used: string | null
          response: string
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          model_used?: string | null
          response: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          model_used?: string | null
          response?: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      client_profile_changes: {
        Row: {
          created_at: string | null
          field_path: string
          id: string
          new_value: string | null
          old_value: string | null
          portal_client_id: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_path: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          portal_client_id: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_path?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          portal_client_id?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profile_changes_portal_client_id_fkey"
            columns: ["portal_client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          additional_info: string | null
          age_max: number | null
          age_min: number | null
          brand_tone: string | null
          business_description: string | null
          business_hours_end: string | null
          business_hours_start: string | null
          cnpj: string | null
          company_name: string
          company_size: string | null
          contact_name: string | null
          created_at: string | null
          crm_used: string | null
          desires: string | null
          email: string | null
          fonts: string | null
          gender: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          main_niche: string | null
          main_pains: string | null
          monthly_revenue: string | null
          phone: string | null
          primary_color: string | null
          products_services: string | null
          secondary_color: string | null
          sla_response: string | null
          social_class: string | null
          status: string
          support_channels: string[] | null
          terms_accepted: boolean | null
          time_in_market: string | null
          updated_at: string | null
          user_id: string
          visual_elements: string | null
          visual_personality: string | null
          website: string | null
          working_days: string[] | null
        }
        Insert: {
          additional_info?: string | null
          age_max?: number | null
          age_min?: number | null
          brand_tone?: string | null
          business_description?: string | null
          business_hours_end?: string | null
          business_hours_start?: string | null
          cnpj?: string | null
          company_name: string
          company_size?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_used?: string | null
          desires?: string | null
          email?: string | null
          fonts?: string | null
          gender?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          main_niche?: string | null
          main_pains?: string | null
          monthly_revenue?: string | null
          phone?: string | null
          primary_color?: string | null
          products_services?: string | null
          secondary_color?: string | null
          sla_response?: string | null
          social_class?: string | null
          status?: string
          support_channels?: string[] | null
          terms_accepted?: boolean | null
          time_in_market?: string | null
          updated_at?: string | null
          user_id: string
          visual_elements?: string | null
          visual_personality?: string | null
          website?: string | null
          working_days?: string[] | null
        }
        Update: {
          additional_info?: string | null
          age_max?: number | null
          age_min?: number | null
          brand_tone?: string | null
          business_description?: string | null
          business_hours_end?: string | null
          business_hours_start?: string | null
          cnpj?: string | null
          company_name?: string
          company_size?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_used?: string | null
          desires?: string | null
          email?: string | null
          fonts?: string | null
          gender?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          main_niche?: string | null
          main_pains?: string | null
          monthly_revenue?: string | null
          phone?: string | null
          primary_color?: string | null
          products_services?: string | null
          secondary_color?: string | null
          sla_response?: string | null
          social_class?: string | null
          status?: string
          support_channels?: string[] | null
          terms_accepted?: boolean | null
          time_in_market?: string | null
          updated_at?: string | null
          user_id?: string
          visual_elements?: string | null
          visual_personality?: string | null
          website?: string | null
          working_days?: string[] | null
        }
        Relationships: []
      }
      comentarios: {
        Row: {
          autor_id: string | null
          conteudo: string
          created_at: string | null
          id: string
          tarefa_id: string
          updated_at: string | null
        }
        Insert: {
          autor_id?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
          tarefa_id: string
          updated_at?: string | null
        }
        Update: {
          autor_id?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
          tarefa_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_tarefa: {
        Row: {
          autor: string
          conteudo: string
          criado_em: string | null
          id: string
          tarefa_id: string
        }
        Insert: {
          autor?: string
          conteudo: string
          criado_em?: string | null
          id?: string
          tarefa_id: string
        }
        Update: {
          autor?: string
          conteudo?: string
          criado_em?: string | null
          id?: string
          tarefa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_tarefa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pipeline: {
        Row: {
          approval_status: string
          assignee: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          sort_order: number
          stage: string
          title: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          assignee?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          stage?: string
          title: string
          user_id: string
        }
        Update: {
          approval_status?: string
          assignee?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          stage?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      cost_history: {
        Row: {
          created_at: string | null
          hosting: number
          ia: number
          id: string
          month: string
          tools: number
        }
        Insert: {
          created_at?: string | null
          hosting?: number
          ia?: number
          id?: string
          month: string
          tools?: number
        }
        Update: {
          created_at?: string | null
          hosting?: number
          ia?: number
          id?: string
          month?: string
          tools?: number
        }
        Relationships: []
      }
      dashboard_activities: {
        Row: {
          created_at: string | null
          id: string
          message: string
          time: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          time: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          time?: string
          type?: string
        }
        Relationships: []
      }
      dashboard_apps: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          status?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          status?: string
        }
        Relationships: []
      }
      dashboard_costs: {
        Row: {
          created_at: string | null
          id: string
          label: string
          month: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          month?: string
          value?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          month?: string
          value?: number
        }
        Relationships: []
      }
      decisoes: {
        Row: {
          contexto: string
          created_at: string | null
          data: string
          decisao: string
          id: string
          impacto: string | null
          responsavel: string
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          contexto: string
          created_at?: string | null
          data?: string
          decisao: string
          id?: string
          impacto?: string | null
          responsavel: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          contexto?: string
          created_at?: string | null
          data?: string
          decisao?: string
          id?: string
          impacto?: string | null
          responsavel?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      giles_consultas: {
        Row: {
          confianca_media: number | null
          consulta: string
          consulta_embedding: string | null
          created_at: string | null
          fontes: string[] | null
          id: string
          metadata: Json | null
          resposta: string | null
          satisfacao: number | null
          session_id: string | null
          tempo_resposta_ms: number | null
          usuario_id: string | null
        }
        Insert: {
          confianca_media?: number | null
          consulta: string
          consulta_embedding?: string | null
          created_at?: string | null
          fontes?: string[] | null
          id?: string
          metadata?: Json | null
          resposta?: string | null
          satisfacao?: number | null
          session_id?: string | null
          tempo_resposta_ms?: number | null
          usuario_id?: string | null
        }
        Update: {
          confianca_media?: number | null
          consulta?: string
          consulta_embedding?: string | null
          created_at?: string | null
          fontes?: string[] | null
          id?: string
          metadata?: Json | null
          resposta?: string | null
          satisfacao?: number | null
          session_id?: string | null
          tempo_resposta_ms?: number | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      giles_dominios: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nivel: number | null
          nome: string
          pai_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nivel?: number | null
          nome: string
          pai_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nivel?: number | null
          nome?: string
          pai_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giles_dominios_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "giles_dominios"
            referencedColumns: ["id"]
          },
        ]
      }
      giles_knowledge: {
        Row: {
          chunk_id: string | null
          confianca: number | null
          content: string
          content_hash: string
          created_at: string
          doc_id: string
          embedding: string | null
          entidades: Json | null
          hierarchical_path: string
          id: string
          keywords: string[] | null
          metadata: Json | null
          pai_id: string | null
          relacionamentos: Json | null
          source_type: string | null
          subcategoria: string | null
          updated_at: string
        }
        Insert: {
          chunk_id?: string | null
          confianca?: number | null
          content: string
          content_hash: string
          created_at?: string
          doc_id: string
          embedding?: string | null
          entidades?: Json | null
          hierarchical_path: string
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          pai_id?: string | null
          relacionamentos?: Json | null
          source_type?: string | null
          subcategoria?: string | null
          updated_at?: string
        }
        Update: {
          chunk_id?: string | null
          confianca?: number | null
          content?: string
          content_hash?: string
          created_at?: string
          doc_id?: string
          embedding?: string | null
          entidades?: Json | null
          hierarchical_path?: string
          id?: string
          keywords?: string[] | null
          metadata?: Json | null
          pai_id?: string | null
          relacionamentos?: Json | null
          source_type?: string | null
          subcategoria?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      giles_sinonimos: {
        Row: {
          created_at: string | null
          dominio: string | null
          id: string
          sinonimos: string[]
          termo: string
        }
        Insert: {
          created_at?: string | null
          dominio?: string | null
          id?: string
          sinonimos: string[]
          termo: string
        }
        Update: {
          created_at?: string | null
          dominio?: string | null
          id?: string
          sinonimos?: string[]
          termo?: string
        }
        Relationships: []
      }
      github_config: {
        Row: {
          created_at: string | null
          id: string
          repo: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          repo: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          repo?: string
          status?: string
        }
        Relationships: []
      }
      google_drive_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          refresh_token: string | null
          scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hermione_artifact_sources: {
        Row: {
          artifact_id: string
          contribution_type: string
          created_at: string | null
          source_id: string
        }
        Insert: {
          artifact_id: string
          contribution_type?: string
          created_at?: string | null
          source_id: string
        }
        Update: {
          artifact_id?: string
          contribution_type?: string
          created_at?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hermione_artifact_sources_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "hermione_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hermione_artifact_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "hermione_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      hermione_artifact_versions: {
        Row: {
          artifact_id: string
          change_note: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          version: number
        }
        Insert: {
          artifact_id: string
          change_note?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          version: number
        }
        Update: {
          artifact_id?: string
          change_note?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "hermione_artifact_versions_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "hermione_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      hermione_artifacts: {
        Row: {
          artifact_type: string
          content: string
          created_at: string | null
          created_by: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          scope: string
          status: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          version: number
        }
        Insert: {
          artifact_type?: string
          content: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          scope?: string
          status?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: number
        }
        Update: {
          artifact_type?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          scope?: string
          status?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      hermione_consultations: {
        Row: {
          artifact_ids: string[] | null
          created_at: string | null
          created_by: string | null
          feedback: number | null
          id: string
          metadata: Json | null
          query: string
          response: string | null
          source_ids: string[] | null
        }
        Insert: {
          artifact_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          feedback?: number | null
          id?: string
          metadata?: Json | null
          query: string
          response?: string | null
          source_ids?: string[] | null
        }
        Update: {
          artifact_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          feedback?: number | null
          id?: string
          metadata?: Json | null
          query?: string
          response?: string | null
          source_ids?: string[] | null
        }
        Relationships: []
      }
      hermione_relationships: {
        Row: {
          created_at: string | null
          from_artifact_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          relationship_type: string
          to_artifact_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_artifact_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          relationship_type: string
          to_artifact_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_artifact_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          relationship_type?: string
          to_artifact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hermione_relationships_from_artifact_id_fkey"
            columns: ["from_artifact_id"]
            isOneToOne: false
            referencedRelation: "hermione_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hermione_relationships_to_artifact_id_fkey"
            columns: ["to_artifact_id"]
            isOneToOne: false
            referencedRelation: "hermione_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      hermione_sources: {
        Row: {
          author: string | null
          content: string
          content_hash: string
          created_at: string | null
          created_by: string | null
          detected_type: string
          embedding: string | null
          file_name: string
          id: string
          metadata: Json | null
          origin: string | null
          source_type: string
          tags: string[] | null
          title: string
        }
        Insert: {
          author?: string | null
          content: string
          content_hash: string
          created_at?: string | null
          created_by?: string | null
          detected_type?: string
          embedding?: string | null
          file_name: string
          id?: string
          metadata?: Json | null
          origin?: string | null
          source_type?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          author?: string | null
          content?: string
          content_hash?: string
          created_at?: string | null
          created_by?: string | null
          detected_type?: string
          embedding?: string | null
          file_name?: string
          id?: string
          metadata?: Json | null
          origin?: string | null
          source_type?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      logs_execucao_agente: {
        Row: {
          agente_id: string
          duracao_segundos: number | null
          finalizado_em: string | null
          id: string
          iniciado_em: string
          mensagem: string | null
          output: Json | null
          status: string
          tarefa_id: string | null
        }
        Insert: {
          agente_id: string
          duracao_segundos?: number | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          output?: Json | null
          status: string
          tarefa_id?: string | null
        }
        Update: {
          agente_id?: string
          duracao_segundos?: number | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          mensagem?: string | null
          output?: Json | null
          status?: string
          tarefa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_execucao_agente_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      mex_sync: {
        Row: {
          created_at: string | null
          id: string
          label: string
          last_sync: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          last_sync?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          last_sync?: string | null
          status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      operadores: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cargo: string
          created_at: string
          email: string
          id: string
          nivel_permissao: Database["public"]["Enums"]["nivel_permissao"]
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cargo: string
          created_at?: string
          email: string
          id?: string
          nivel_permissao?: Database["public"]["Enums"]["nivel_permissao"]
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string
          created_at?: string
          email?: string
          id?: string
          nivel_permissao?: Database["public"]["Enums"]["nivel_permissao"]
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      pops: {
        Row: {
          conteudo: string | null
          created_at: string
          criado_por: string | null
          departamento: string
          descricao: string | null
          id: string
          responsavel: string | null
          sla_horas: number | null
          status: string
          tags: string[] | null
          titulo: string
          updated_at: string
          versao: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          criado_por?: string | null
          departamento?: string
          descricao?: string | null
          id?: string
          responsavel?: string | null
          sla_horas?: number | null
          status?: string
          tags?: string[] | null
          titulo: string
          updated_at?: string
          versao?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          criado_por?: string | null
          departamento?: string
          descricao?: string | null
          id?: string
          responsavel?: string | null
          sla_horas?: number | null
          status?: string
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          versao?: string | null
        }
        Relationships: []
      }
      portal_client_users: {
        Row: {
          client_id: string
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_clients: {
        Row: {
          cnpj: string | null
          contato_principal: string | null
          contract_id: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          descricao_negocio: string | null
          drive_folder_cliente_id: string | null
          drive_folder_id: string | null
          email_responsavel: string
          faturamento_mensal: string | null
          google_customer_id: string | null
          google_developer_token: string | null
          google_refresh_token: string | null
          id: string
          meta_access_token: string | null
          meta_ad_account_id: string | null
          meta_token_expires_at: string | null
          nome: string
          nome_responsavel: string | null
          produtos_servicos: string | null
          profile_data: Json | null
          ramo_atuacao: string | null
          site: string | null
          slug: string
          status: string | null
          tamanho_empresa: string | null
          telefone: string | null
          tempo_mercado: string | null
          updated_at: string | null
          upixel_account_id: string | null
          upixel_tenant_id: string | null
        }
        Insert: {
          cnpj?: string | null
          contato_principal?: string | null
          contract_id?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          descricao_negocio?: string | null
          drive_folder_cliente_id?: string | null
          drive_folder_id?: string | null
          email_responsavel: string
          faturamento_mensal?: string | null
          google_customer_id?: string | null
          google_developer_token?: string | null
          google_refresh_token?: string | null
          id?: string
          meta_access_token?: string | null
          meta_ad_account_id?: string | null
          meta_token_expires_at?: string | null
          nome: string
          nome_responsavel?: string | null
          produtos_servicos?: string | null
          profile_data?: Json | null
          ramo_atuacao?: string | null
          site?: string | null
          slug: string
          status?: string | null
          tamanho_empresa?: string | null
          telefone?: string | null
          tempo_mercado?: string | null
          updated_at?: string | null
          upixel_account_id?: string | null
          upixel_tenant_id?: string | null
        }
        Update: {
          cnpj?: string | null
          contato_principal?: string | null
          contract_id?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          descricao_negocio?: string | null
          drive_folder_cliente_id?: string | null
          drive_folder_id?: string | null
          email_responsavel?: string
          faturamento_mensal?: string | null
          google_customer_id?: string | null
          google_developer_token?: string | null
          google_refresh_token?: string | null
          id?: string
          meta_access_token?: string | null
          meta_ad_account_id?: string | null
          meta_token_expires_at?: string | null
          nome?: string
          nome_responsavel?: string | null
          produtos_servicos?: string | null
          profile_data?: Json | null
          ramo_atuacao?: string | null
          site?: string | null
          slug?: string
          status?: string | null
          tamanho_empresa?: string | null
          telefone?: string | null
          tempo_mercado?: string | null
          updated_at?: string | null
          upixel_account_id?: string | null
          upixel_tenant_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          created_at: string | null
          display_name: string | null
          full_name: string | null
          id: string
          idioma: string | null
          phone: string | null
          role: string | null
          telefone: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id: string
          idioma?: string | null
          phone?: string | null
          role?: string | null
          telefone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          created_at?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string
          idioma?: string | null
          phone?: string | null
          role?: string | null
          telefone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projetos: {
        Row: {
          atualizado_em: string | null
          cor: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          portal_client_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          portal_client_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          portal_client_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_portal_client_id_fkey"
            columns: ["portal_client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          agente: string
          ativo: boolean | null
          conteudo: string
          data: string | null
          diff: string | null
          id: string
          nome: string
          versao: number
        }
        Insert: {
          agente: string
          ativo?: boolean | null
          conteudo: string
          data?: string | null
          diff?: string | null
          id?: string
          nome: string
          versao?: number
        }
        Update: {
          agente?: string
          ativo?: boolean | null
          conteudo?: string
          data?: string | null
          diff?: string | null
          id?: string
          nome?: string
          versao?: number
        }
        Relationships: []
      }
      rag_context: {
        Row: {
          agent_id: string
          document_id: string
          id: string
          relevance_score: number
          used_at: string | null
        }
        Insert: {
          agent_id: string
          document_id: string
          id?: string
          relevance_score: number
          used_at?: string | null
        }
        Update: {
          agent_id?: string
          document_id?: string
          id?: string
          relevance_score?: number
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rag_context_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          client_id: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          is_global: boolean | null
          metadata: Json | null
          source: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_global?: boolean | null
          metadata?: Json | null
          source?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_global?: boolean | null
          metadata?: Json | null
          source?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          cost_per_call: number | null
          created_at: string | null
          description: string | null
          emoji: string | null
          id: string
          inputs: Json | null
          model_preference: string | null
          name: string
          outputs: Json | null
          prompt_template: string | null
          status: string | null
          success_rate: number | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category: string
          cost_per_call?: number | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id: string
          inputs?: Json | null
          model_preference?: string | null
          name: string
          outputs?: Json | null
          prompt_template?: string | null
          status?: string | null
          success_rate?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          cost_per_call?: number | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          inputs?: Json | null
          model_preference?: string | null
          name?: string
          outputs?: Json | null
          prompt_template?: string | null
          status?: string | null
          success_rate?: number | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      subtarefas: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          id: string
          tarefa_id: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          id?: string
          tarefa_id: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          id?: string
          tarefa_id?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtarefas_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          co_responsavel_id: string | null
          created_at: string | null
          criado_por: string | null
          data_limite: string | null
          departamento: string | null
          descricao: string | null
          id: string
          portal_client_id: string | null
          posicao: number | null
          prioridade: string
          projeto_id: string | null
          proxima_execucao: string | null
          recorrencia: Database["public"]["Enums"]["tipo_recorrencia"]
          responsavel: string | null
          responsavel_id: string | null
          responsavel_tipo: Database["public"]["Enums"]["tipo_responsavel"]
          status: string
          subtarefas: Json | null
          tags: string[] | null
          tipo: string | null
          titulo: string
          ultima_execucao: string | null
          ultimo_resultado: Json | null
          updated_at: string | null
        }
        Insert: {
          co_responsavel_id?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_limite?: string | null
          departamento?: string | null
          descricao?: string | null
          id?: string
          portal_client_id?: string | null
          posicao?: number | null
          prioridade?: string
          projeto_id?: string | null
          proxima_execucao?: string | null
          recorrencia?: Database["public"]["Enums"]["tipo_recorrencia"]
          responsavel?: string | null
          responsavel_id?: string | null
          responsavel_tipo?: Database["public"]["Enums"]["tipo_responsavel"]
          status?: string
          subtarefas?: Json | null
          tags?: string[] | null
          tipo?: string | null
          titulo: string
          ultima_execucao?: string | null
          ultimo_resultado?: Json | null
          updated_at?: string | null
        }
        Update: {
          co_responsavel_id?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_limite?: string | null
          departamento?: string | null
          descricao?: string | null
          id?: string
          portal_client_id?: string | null
          posicao?: number | null
          prioridade?: string
          projeto_id?: string | null
          proxima_execucao?: string | null
          recorrencia?: Database["public"]["Enums"]["tipo_recorrencia"]
          responsavel?: string | null
          responsavel_id?: string | null
          responsavel_tipo?: Database["public"]["Enums"]["tipo_responsavel"]
          status?: string
          subtarefas?: Json | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string
          ultima_execucao?: string | null
          ultimo_resultado?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_co_responsavel_id_fkey"
            columns: ["co_responsavel_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_portal_client_id_fkey"
            columns: ["portal_client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tarefas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
        ]
      }
      task_recurrence: {
        Row: {
          active: boolean | null
          co_responsavel: string | null
          created_at: string | null
          created_by: string | null
          descricao: string | null
          frequency: string
          id: string
          next_run: string | null
          responsavel: string | null
          telegram_chat_id: string | null
          telegram_enabled: boolean | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          co_responsavel?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          frequency?: string
          id?: string
          next_run?: string | null
          responsavel?: string | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          co_responsavel?: string | null
          created_at?: string | null
          created_by?: string | null
          descricao?: string | null
          frequency?: string
          id?: string
          next_run?: string | null
          responsavel?: string | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      telegram_notifications: {
        Row: {
          chat_id: string
          created_at: string
          enviado: boolean
          id: string
          mensagem: string
          operador_id: string | null
          prioridade: string
          tipo: string
          titulo: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          enviado?: boolean
          id?: string
          mensagem: string
          operador_id?: string | null
          prioridade?: string
          tipo?: string
          titulo: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          enviado?: boolean
          id?: string
          mensagem?: string
          operador_id?: string | null
          prioridade?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_notifications_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_list: {
        Row: {
          created_at: string
          description: string | null
          done: boolean
          done_at: string | null
          id: number
          owner: string
          title: string
          urgent: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          id?: number
          owner: string
          title: string
          urgent?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          done?: boolean
          done_at?: string | null
          id?: number
          owner?: string
          title?: string
          urgent?: boolean
        }
        Relationships: []
      }
      transcription_analysis: {
        Row: {
          created_at: string
          execution_time_ms: number
          id: string
          import_id: string | null
          input_data: Json
          model_used: string
          output_data: Json
          skill_name: string
          status: string
        }
        Insert: {
          created_at?: string
          execution_time_ms?: number
          id?: string
          import_id?: string | null
          input_data?: Json
          model_used?: string
          output_data?: Json
          skill_name: string
          status?: string
        }
        Update: {
          created_at?: string
          execution_time_ms?: number
          id?: string
          import_id?: string | null
          input_data?: Json
          model_used?: string
          output_data?: Json
          skill_name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcription_analysis_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "transcription_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      transcription_imports: {
        Row: {
          criador: string
          error: string | null
          id: string
          imported_at: string
          processed_at: string | null
          status: string
          subject: string
          transcricao: string
        }
        Insert: {
          criador?: string
          error?: string | null
          id?: string
          imported_at?: string
          processed_at?: string | null
          status?: string
          subject?: string
          transcricao: string
        }
        Update: {
          criador?: string
          error?: string | null
          id?: string
          imported_at?: string
          processed_at?: string | null
          status?: string
          subject?: string
          transcricao?: string
        }
        Relationships: []
      }
      user_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          provider: string | null
          rejection_reason: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          provider?: string | null
          rejection_reason?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          provider?: string | null
          rejection_reason?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vps_servers: {
        Row: {
          cpu: number
          created_at: string | null
          description: string | null
          disk: number
          id: string
          name: string
          ram: number
          status: string
        }
        Insert: {
          cpu?: number
          created_at?: string | null
          description?: string | null
          disk?: number
          id?: string
          name: string
          ram?: number
          status?: string
        }
        Update: {
          cpu?: number
          created_at?: string | null
          description?: string | null
          disk?: number
          id?: string
          name?: string
          ram?: number
          status?: string
        }
        Relationships: []
      }
      vps_usage_history: {
        Row: {
          cpu: number
          disk: number
          id: string
          ram: number
          recorded_at: string
          vps_name: string
        }
        Insert: {
          cpu?: number
          disk?: number
          id?: string
          ram?: number
          recorded_at?: string
          vps_name: string
        }
        Update: {
          cpu?: number
          disk?: number
          id?: string
          ram?: number
          recorded_at?: string
          vps_name?: string
        }
        Relationships: []
      }
      wanda_analytics: {
        Row: {
          comments: number | null
          conversion_rate: number | null
          engagement_rate: number | null
          id: number
          likes: number | null
          post_id: string
          recorded_at: string | null
          saves: number | null
          shares: number | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          conversion_rate?: number | null
          engagement_rate?: number | null
          id?: number
          likes?: number | null
          post_id: string
          recorded_at?: string | null
          saves?: number | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          conversion_rate?: number | null
          engagement_rate?: number | null
          id?: number
          likes?: number | null
          post_id?: string
          recorded_at?: string | null
          saves?: number | null
          shares?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wanda_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_wanda_top_posts"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "wanda_analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wanda_posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      wanda_performance: {
        Row: {
          avg_conversion_rate: number | null
          avg_engagement_rate: number | null
          avg_views: number | null
          best_post_id: string | null
          best_views: number | null
          calculated_at: string | null
          creator: string | null
          id: number
          time_period: string | null
          tipo: string | null
          total_comments: number | null
          total_conversions: number | null
          total_likes: number | null
          total_posts: number | null
          total_shares: number | null
          total_views: number | null
        }
        Insert: {
          avg_conversion_rate?: number | null
          avg_engagement_rate?: number | null
          avg_views?: number | null
          best_post_id?: string | null
          best_views?: number | null
          calculated_at?: string | null
          creator?: string | null
          id?: number
          time_period?: string | null
          tipo?: string | null
          total_comments?: number | null
          total_conversions?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          total_views?: number | null
        }
        Update: {
          avg_conversion_rate?: number | null
          avg_engagement_rate?: number | null
          avg_views?: number | null
          best_post_id?: string | null
          best_views?: number | null
          calculated_at?: string | null
          creator?: string | null
          id?: number
          time_period?: string | null
          tipo?: string | null
          total_comments?: number | null
          total_conversions?: number | null
          total_likes?: number | null
          total_posts?: number | null
          total_shares?: number | null
          total_views?: number | null
        }
        Relationships: []
      }
      wanda_posts: {
        Row: {
          body: string | null
          comments: number | null
          conversion_rate: number | null
          created_at: string | null
          creator: string
          cta: string | null
          emojis: string | null
          engagement_rate: number | null
          estimated_conversions: number | null
          hashtags: string[] | null
          hashtags_string: string | null
          hook: string
          id: number
          last_updated_at: string | null
          likes: number | null
          portal_client_id: string | null
          post_id: string
          published_at: string | null
          saves: number | null
          shares: number | null
          subject: string
          tiktok_url: string | null
          tiktok_video_id: string | null
          tipo: string
          views: number | null
        }
        Insert: {
          body?: string | null
          comments?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          creator: string
          cta?: string | null
          emojis?: string | null
          engagement_rate?: number | null
          estimated_conversions?: number | null
          hashtags?: string[] | null
          hashtags_string?: string | null
          hook: string
          id?: number
          last_updated_at?: string | null
          likes?: number | null
          portal_client_id?: string | null
          post_id: string
          published_at?: string | null
          saves?: number | null
          shares?: number | null
          subject: string
          tiktok_url?: string | null
          tiktok_video_id?: string | null
          tipo: string
          views?: number | null
        }
        Update: {
          body?: string | null
          comments?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          creator?: string
          cta?: string | null
          emojis?: string | null
          engagement_rate?: number | null
          estimated_conversions?: number | null
          hashtags?: string[] | null
          hashtags_string?: string | null
          hook?: string
          id?: number
          last_updated_at?: string | null
          likes?: number | null
          portal_client_id?: string | null
          post_id?: string
          published_at?: string | null
          saves?: number | null
          shares?: number | null
          subject?: string
          tiktok_url?: string | null
          tiktok_video_id?: string | null
          tipo?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wanda_posts_portal_client_id_fkey"
            columns: ["portal_client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      wanda_trending: {
        Row: {
          id: number
          post_id: string
          rank: number | null
          trend_score: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          post_id: string
          rank?: number | null
          trend_score: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          post_id?: string
          rank?: number | null
          trend_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wanda_trending_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_wanda_top_posts"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "wanda_trending_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "wanda_posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
    }
    Views: {
      v_wanda_performance_by_creator: {
        Row: {
          avg_engagement: number | null
          avg_views: number | null
          creator: string | null
          max_views: number | null
          total_conversions: number | null
          total_posts: number | null
          total_views: number | null
        }
        Relationships: []
      }
      v_wanda_performance_by_type: {
        Row: {
          avg_engagement: number | null
          avg_views: number | null
          max_views: number | null
          tipo: string | null
          total_conversions: number | null
          total_posts: number | null
          total_views: number | null
        }
        Relationships: []
      }
      v_wanda_top_posts: {
        Row: {
          comments: number | null
          creator: string | null
          engagement_rate: number | null
          likes: number | null
          performance_level: string | null
          post_id: string | null
          shares: number | null
          subject: string | null
          tipo: string | null
          views: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_embedding: { Args: { text_input: string }; Returns: string }
      get_user_client_id: { Args: never; Returns: string }
      giles_get_tree: {
        Args: { root_id: string }
        Returns: {
          caminho: string[]
          categoria: string
          content_preview: string
          dominio: string
          id: string
          nivel: number
        }[]
      }
      giles_search_by_domain: {
        Args: {
          match_count?: number
          query_embedding: string
          target_dominio: string
        }
        Returns: {
          categoria: string
          content: string
          id: string
          similarity: number
          tags: string[]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_user: { Args: never; Returns: boolean }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          doc_id: string
          hierarchical_path: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          autor: string
          categoria: string
          confianca: number
          content: string
          dominio: string
          id: string
          keywords: string[]
          similarity: number
          source_file: string
          subcategoria: string
          tags: string[]
        }[]
      }
      search_docs: {
        Args: {
          doc_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          doc_type: string
          id: string
          path: string
          relevance: number
          title: string
        }[]
      }
      search_pops: {
        Args: {
          doc_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          doc_type: string
          id: string
          path: string
          relevance: number
          title: string
        }[]
      }
      search_skills: {
        Args: {
          doc_type?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          doc_type: string
          id: string
          path: string
          relevance: number
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "master" | "cliente"
      nivel_permissao: "admin" | "gestor" | "operador" | "visitante"
      tipo_recorrencia: "diaria" | "semanal" | "mensal" | "nenhuma"
      tipo_responsavel: "humano" | "robo"
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
      app_role: ["admin", "moderator", "user", "master", "cliente"],
      nivel_permissao: ["admin", "gestor", "operador", "visitante"],
      tipo_recorrencia: ["diaria", "semanal", "mensal", "nenhuma"],
      tipo_responsavel: ["humano", "robo"],
    },
  },
} as const
