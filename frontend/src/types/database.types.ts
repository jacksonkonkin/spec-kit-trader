export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      class_memberships: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          starting_balance: number | null
          user_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          starting_balance?: number | null
          user_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          starting_balance?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_memberships_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_summary_view"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_memberships_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "class_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_portfolio_summary_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          end_date: string
          id: string
          invite_code: string
          is_active: boolean | null
          name: string
          semester: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          invite_code: string
          is_active?: boolean | null
          name: string
          semester: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          invite_code?: string
          is_active?: boolean | null
          name?: string
          semester?: string
          start_date?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          initial_value: number
          purchase_date: string
          purchase_price: number
          shares: number
          stock_symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_value?: number
          purchase_date?: string
          purchase_price: number
          shares: number
          stock_symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_value?: number
          purchase_date?: string
          purchase_price?: number
          shares?: number
          stock_symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_popularity_view"
            referencedColumns: ["symbol"]
          },
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_prices"
            referencedColumns: ["symbol"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_portfolio_summary_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stock_prices: {
        Row: {
          company_name: string
          current_price: number
          day_change: number | null
          day_change_percent: number | null
          last_updated: string
          market_status: string | null
          previous_close: number | null
          symbol: string
        }
        Insert: {
          company_name: string
          current_price: number
          day_change?: number | null
          day_change_percent?: number | null
          last_updated?: string
          market_status?: string | null
          previous_close?: number | null
          symbol: string
        }
        Update: {
          company_name?: string
          current_price?: number
          day_change?: number | null
          day_change_percent?: number | null
          last_updated?: string
          market_status?: string | null
          previous_close?: number | null
          symbol?: string
        }
        Relationships: []
      }
    }
    Views: {
      class_summary_view: {
        Row: {
          average_return_percentage: number | null
          best_return_percentage: number | null
          class_id: string | null
          class_name: string | null
          end_date: string | null
          invite_code: string | null
          is_active: boolean | null
          members_with_investments: number | null
          semester: string | null
          start_date: string | null
          total_members: number | null
          worst_return_percentage: number | null
        }
        Relationships: []
      }
      leaderboard_view: {
        Row: {
          class_id: string | null
          company_name: string | null
          current_price: number | null
          current_value: number | null
          email: string | null
          initial_value: number | null
          joined_at: string | null
          purchase_date: string | null
          purchase_price: number | null
          rank: number | null
          return_percentage: number | null
          shares: number | null
          stock_symbol: string | null
          total_return: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_memberships_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "class_summary_view"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_memberships_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_popularity_view"
            referencedColumns: ["symbol"]
          },
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_prices"
            referencedColumns: ["symbol"]
          },
        ]
      }
      portfolio_performance_view: {
        Row: {
          company_name: string | null
          current_price: number | null
          current_value: number | null
          day_change: number | null
          day_change_percent: number | null
          initial_value: number | null
          last_updated: string | null
          market_status: string | null
          previous_close: number | null
          purchase_date: string | null
          purchase_price: number | null
          return_percentage: number | null
          shares: number | null
          stock_symbol: string | null
          total_return: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_popularity_view"
            referencedColumns: ["symbol"]
          },
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_prices"
            referencedColumns: ["symbol"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_portfolio_summary_view"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stock_popularity_view: {
        Row: {
          average_return_amount: number | null
          average_return_percentage: number | null
          company_name: string | null
          current_price: number | null
          day_change: number | null
          day_change_percent: number | null
          investment_count: number | null
          symbol: string | null
          total_shares_invested: number | null
          total_value_invested: number | null
        }
        Relationships: []
      }
      user_portfolio_summary_view: {
        Row: {
          class_memberships_count: number | null
          company_name: string | null
          current_price: number | null
          current_value: number | null
          email: string | null
          has_portfolio: boolean | null
          initial_value: number | null
          purchase_date: string | null
          purchase_price: number | null
          return_percentage: number | null
          shares: number | null
          stock_symbol: string | null
          total_return: number | null
          user_created_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_popularity_view"
            referencedColumns: ["symbol"]
          },
          {
            foreignKeyName: "portfolios_stock_symbol_fkey"
            columns: ["stock_symbol"]
            isOneToOne: false
            referencedRelation: "stock_prices"
            referencedColumns: ["symbol"]
          },
        ]
      }
    }
    Functions: {
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_class_leaderboard: {
        Args: { class_uuid: string }
        Returns: {
          company_name: string
          current_price: number
          current_value: number
          email: string
          initial_value: number
          joined_at: string
          purchase_date: string
          purchase_price: number
          rank: number
          return_percentage: number
          shares: number
          stock_symbol: string
          total_return: number
          user_id: string
        }[]
      }
      get_current_stock_price: {
        Args: { stock_symbol: string }
        Returns: {
          company_name: string
          current_price: number
          day_change: number
          day_change_percent: number
          is_stale: boolean
          last_updated: string
          market_status: string
          previous_close: number
          symbol: string
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          id: string
        }[]
      }
      get_portfolio_performance: {
        Args: { portfolio_user_id: string }
        Returns: {
          company_name: string
          current_price: number
          current_value: number
          initial_value: number
          purchase_date: string
          purchase_price: number
          return_percentage: number
          shares: number
          stock_symbol: string
          total_return: number
          user_id: string
        }[]
      }
      get_user_profile: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          id: string
        }[]
      }
      is_class_active: {
        Args: { class_uuid: string }
        Returns: boolean
      }
      join_class_by_invite_code: {
        Args: { invite_code_param: string; user_uuid: string }
        Returns: string
      }
      refresh_performance_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      should_update_stock_price: {
        Args: { stock_symbol: string }
        Returns: boolean
      }
      user_can_view_class: {
        Args: { class_uuid: string }
        Returns: boolean
      }
      user_is_class_member: {
        Args: { class_uuid: string }
        Returns: boolean
      }
      user_owns_portfolio: {
        Args: { portfolio_uuid: string }
        Returns: boolean
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

