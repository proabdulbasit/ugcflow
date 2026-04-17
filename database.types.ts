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
      brands: {
        Row: {
          brand_goals: string | null
          company_name: string | null
          created_at: string
          credits: number
          id: string
          status: Database["public"]["Enums"]["application_status"]
          website_url: string | null
        }
        Insert: {
          brand_goals?: string | null
          company_name?: string | null
          created_at?: string
          credits?: number
          id: string
          status?: Database["public"]["Enums"]["application_status"]
          website_url?: string | null
        }
        Update: {
          brand_goals?: string | null
          company_name?: string | null
          created_at?: string
          credits?: number
          id?: string
          status?: Database["public"]["Enums"]["application_status"]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_applications: {
        Row: {
          campaign_id: string
          created_at: string
          creator_id: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_id: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_id?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaign_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_applications_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creators: {
        Row: {
          assigned_at: string
          campaign_id: string
          creator_id: string
        }
        Insert: {
          assigned_at?: string
          campaign_id: string
          creator_id: string
        }
        Update: {
          assigned_at?: string
          campaign_id?: string
          creator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creators_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          brief: string | null
          created_at: string
          id: string
          payout_amount: number
          status: Database["public"]["Enums"]["campaign_status"]
          title: string
        }
        Insert: {
          brand_id: string
          brief?: string | null
          created_at?: string
          id?: string
          payout_amount?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          title: string
        }
        Update: {
          brand_id?: string
          brief?: string | null
          created_at?: string
          id?: string
          payout_amount?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_earnings: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          creator_id: string
          deliverable_id: string
          id: string
          status: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          creator_id: string
          deliverable_id: string
          id?: string
          status?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          creator_id?: string
          deliverable_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_earnings_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_earnings_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_earnings_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: true
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          portfolio_url: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          portfolio_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          portfolio_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "creators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          campaign_id: string
          created_at: string
          creator_id: string
          feedback: string | null
          file_url: string | null
          id: string
          revision_count: number
          status: Database["public"]["Enums"]["deliverable_status"]
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_id: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          revision_count?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_id?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          revision_count?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          stripe_price_id: string | null
          video_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          stripe_price_id?: string | null
          video_count: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          stripe_price_id?: string | null
          video_count?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          brand_id: string | null
          created_at: string
          id: string
          package_id: string | null
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          brand_id?: string | null
          created_at?: string
          id?: string
          package_id?: string | null
          status: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          brand_id?: string | null
          created_at?: string
          id?: string
          package_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hire_creator: {
        Args: {
          p_brand_id: string
          p_campaign_id: string
          p_creator_id: string
        }
        Returns: undefined
      }
      increment_brand_credits: {
        Args: { amount_input: number; brand_id_input: string }
        Returns: undefined
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      campaign_status: "draft" | "active" | "completed"
      deliverable_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "creator" | "brand"
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
      application_status: ["pending", "approved", "rejected"],
      campaign_status: ["draft", "active", "completed"],
      deliverable_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "creator", "brand"],
    },
  },
} as const
