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
      gunpla_kits: {
        Row: {
          brand: Database["public"]["Enums"]["kit_brand"]
          created_at: string
          grade: Database["public"]["Enums"]["gunpla_grade"]
          id: string
          image_url: string | null
          model_name: string
          model_number: string
          subline: Database["public"]["Enums"]["gunpla_subline"] | null
          notes: string | null
          owned: boolean
          exclusive: boolean
          purchase_date: string | null
          purchase_price: number | null
          release_year: number | null
          series: string | null
          user_id: string
        }
        Insert: {
          brand?: Database["public"]["Enums"]["kit_brand"]
          created_at?: string
          grade: Database["public"]["Enums"]["gunpla_grade"]
          id?: string
          image_url?: string | null
          model_name: string
          model_number: string
          subline?: Database["public"]["Enums"]["gunpla_subline"] | null
          notes?: string | null
          owned?: boolean
          exclusive?: boolean
          purchase_date?: string | null
          purchase_price?: number | null
          release_year?: number | null
          series?: string | null
          user_id?: string
        }
        Update: {
          brand?: Database["public"]["Enums"]["kit_brand"]
          created_at?: string
          grade?: Database["public"]["Enums"]["gunpla_grade"]
          id?: string
          image_url?: string | null
          model_name?: string
          model_number?: string
          subline?: Database["public"]["Enums"]["gunpla_subline"] | null
          notes?: string | null
          owned?: boolean
          exclusive?: boolean
          purchase_date?: string | null
          purchase_price?: number | null
          release_year?: number | null
          series?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
        }
        profiles: {
          Row: {
            id: string
            user_id: string
            display_name: string | null
            username: string | null
            avatar_url: string | null
            updated_at: string | null
          }
          Insert: {
            id?: string
            user_id: string
            display_name?: string | null
            username?: string | null
            avatar_url?: string | null
            updated_at?: string | null
          }
          Update: {
            id?: string
            user_id?: string
            display_name?: string | null
            username?: string | null
            avatar_url?: string | null
            updated_at?: string | null
          }
          Relationships: [
            {
              foreignKeyName: "profiles_user_id_fkey"
              columns: ["user_id"]
              isOneToOne: true
              referencedRelation: "users"
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
      kit_brand: "Bandai" | "SNAA" | "Motor Nuclear" | "In Era+" | "Hemoxian" | "CangDao" | "AniMester" | "Other"
      gunpla_grade: "HG" | "RG" | "MG" | "PG" | "EG" | "SD" | "BB" | "RE/100" | "FM" | "NG"
      gunpla_subline: "HGUC" | "HGIBO" | "HGCE" | "HG00" | "HGAC" | "HGAGE" | "HGBF" | "HGGTO" | "HGBC"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

