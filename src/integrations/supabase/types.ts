export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      community_qr_codes: {
        Row: {
          city: string | null
          created_at: string
          id: string
          location: string | null
          name: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      daily_inventory: {
        Row: {
          created_at: string
          date: string
          establishment_id: string
          id: string
          register_opened: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          establishment_id: string
          id?: string
          register_opened?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          establishment_id?: string
          id?: string
          register_opened?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_products: {
        Row: {
          available: boolean
          created_at: string
          daily_inventory_id: string
          id: string
          initial_stock: number | null
          minimum_stock: number | null
          product_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          daily_inventory_id: string
          id?: string
          initial_stock?: number | null
          minimum_stock?: number | null
          product_id: string
        }
        Update: {
          available?: boolean
          created_at?: string
          daily_inventory_id?: string
          id?: string
          initial_stock?: number | null
          minimum_stock?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_products_daily_inventory_id_fkey"
            columns: ["daily_inventory_id"]
            isOneToOne: false
            referencedRelation: "daily_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_qr_codes: {
        Row: {
          active: boolean
          community_qr_id: string
          created_at: string
          establishment_id: string
          id: string
        }
        Insert: {
          active?: boolean
          community_qr_id: string
          created_at?: string
          establishment_id: string
          id?: string
        }
        Update: {
          active?: boolean
          community_qr_id?: string
          created_at?: string
          establishment_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_qr_codes_community_qr_id_fkey"
            columns: ["community_qr_id"]
            isOneToOne: false
            referencedRelation: "community_qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_qr_codes_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishments: {
        Row: {
          active: boolean
          address: string | null
          billing_amount: number | null
          billing_plan: string | null
          billing_status: string | null
          city: string | null
          created_at: string
          id: string
          in_community_qr: boolean | null
          last_payment_date: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          billing_amount?: number | null
          billing_plan?: string | null
          billing_status?: string | null
          city?: string | null
          created_at?: string
          id?: string
          in_community_qr?: boolean | null
          last_payment_date?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          billing_amount?: number | null
          billing_plan?: string | null
          billing_status?: string | null
          city?: string | null
          created_at?: string
          id?: string
          in_community_qr?: boolean | null
          last_payment_date?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          notes: string | null
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          notes?: string | null
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          notes?: string | null
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string | null
          id: string
          payment_method: string
          status: string
          table_id: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          id?: string
          payment_method: string
          status?: string
          table_id?: string | null
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          id?: string
          payment_method?: string
          status?: string
          table_id?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string
          description: string
          id: string
          image: string
          name: string
          out_of_stock: boolean
          price: number
        }
        Insert: {
          category_id: string
          description: string
          id?: string
          image: string
          name: string
          out_of_stock?: boolean
          price: number
        }
        Update: {
          category_id?: string
          description?: string
          id?: string
          image?: string
          name?: string
          out_of_stock?: boolean
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant: {
        Row: {
          establishment_id: string | null
          id: string
          logo: string | null
          name: string
          payment_cash: boolean
          payment_credit_card: boolean
          payment_later: boolean
          payment_pix: boolean
          payment_timing: string
          theme_color: string | null
          use_tables: boolean
        }
        Insert: {
          establishment_id?: string | null
          id?: string
          logo?: string | null
          name: string
          payment_cash?: boolean
          payment_credit_card?: boolean
          payment_later?: boolean
          payment_pix?: boolean
          payment_timing?: string
          theme_color?: string | null
          use_tables?: boolean
        }
        Update: {
          establishment_id?: string | null
          id?: string
          logo?: string | null
          name?: string
          payment_cash?: boolean
          payment_credit_card?: boolean
          payment_later?: boolean
          payment_pix?: boolean
          payment_timing?: string
          theme_color?: string | null
          use_tables?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          feature_analytics: boolean
          feature_customization: boolean
          feature_multi_location: boolean
          feature_notifications: boolean
          feature_offline_mode: boolean
          feature_payment_integration: boolean
          feature_qr_community: boolean
          id: string
          is_popular: boolean
          max_products: number
          max_users: number
          name: string
          price: number
          type: string
        }
        Insert: {
          billing_cycle: string
          created_at?: string
          feature_analytics?: boolean
          feature_customization?: boolean
          feature_multi_location?: boolean
          feature_notifications?: boolean
          feature_offline_mode?: boolean
          feature_payment_integration?: boolean
          feature_qr_community?: boolean
          id?: string
          is_popular?: boolean
          max_products?: number
          max_users?: number
          name: string
          price?: number
          type: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          feature_analytics?: boolean
          feature_customization?: boolean
          feature_multi_location?: boolean
          feature_notifications?: boolean
          feature_offline_mode?: boolean
          feature_payment_integration?: boolean
          feature_qr_community?: boolean
          id?: string
          is_popular?: boolean
          max_products?: number
          max_users?: number
          name?: string
          price?: number
          type?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          establishment_id: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          establishment_id?: string | null
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          establishment_id?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_subscription_plan: {
        Args: { plan_id: string }
        Returns: boolean
      }
      get_subscription_plans: {
        Args: Record<PropertyKey, never>
        Returns: {
          billing_cycle: string
          created_at: string
          feature_analytics: boolean
          feature_customization: boolean
          feature_multi_location: boolean
          feature_notifications: boolean
          feature_offline_mode: boolean
          feature_payment_integration: boolean
          feature_qr_community: boolean
          id: string
          is_popular: boolean
          max_products: number
          max_users: number
          name: string
          price: number
          type: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      insert_subscription_plan: {
        Args: { plan_data: Json }
        Returns: {
          billing_cycle: string
          created_at: string
          feature_analytics: boolean
          feature_customization: boolean
          feature_multi_location: boolean
          feature_notifications: boolean
          feature_offline_mode: boolean
          feature_payment_integration: boolean
          feature_qr_community: boolean
          id: string
          is_popular: boolean
          max_products: number
          max_users: number
          name: string
          price: number
          type: string
        }
      }
      update_subscription_plan: {
        Args: { plan_id: string; plan_data: Json }
        Returns: {
          billing_cycle: string
          created_at: string
          feature_analytics: boolean
          feature_customization: boolean
          feature_multi_location: boolean
          feature_notifications: boolean
          feature_offline_mode: boolean
          feature_payment_integration: boolean
          feature_qr_community: boolean
          id: string
          is_popular: boolean
          max_products: number
          max_users: number
          name: string
          price: number
          type: string
        }
      }
      user_belongs_to_establishment: {
        Args: { establishment_uuid: string }
        Returns: boolean
      }
      user_is_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "master" | "admin" | "manager" | "kitchen"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["master", "admin", "manager", "kitchen"],
    },
  },
} as const
