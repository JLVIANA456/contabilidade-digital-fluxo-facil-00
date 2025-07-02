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
      arquivos: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          status_mensal_id: string
          tamanho_arquivo: number | null
          tipo_arquivo: string | null
          url_arquivo: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          status_mensal_id: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          url_arquivo?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          status_mensal_id?: string
          tamanho_arquivo?: number | null
          tipo_arquivo?: string | null
          url_arquivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_status_mensal_id_fkey"
            columns: ["status_mensal_id"]
            isOneToOne: false
            referencedRelation: "status_mensal"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean
          cnpj_cpf: string | null
          colaborador_responsavel: Database["public"]["Enums"]["colaborador_responsavel"]
          created_at: string
          data_entrada: string | null
          data_saida: string | null
          id: string
          nome: string
          regime_tributario: Database["public"]["Enums"]["regime_tributario"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj_cpf?: string | null
          colaborador_responsavel?: Database["public"]["Enums"]["colaborador_responsavel"]
          created_at?: string
          data_entrada?: string | null
          data_saida?: string | null
          id?: string
          nome: string
          regime_tributario?: Database["public"]["Enums"]["regime_tributario"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj_cpf?: string | null
          colaborador_responsavel?: Database["public"]["Enums"]["colaborador_responsavel"]
          created_at?: string
          data_entrada?: string | null
          data_saida?: string | null
          id?: string
          nome?: string
          regime_tributario?: Database["public"]["Enums"]["regime_tributario"]
          updated_at?: string
        }
        Relationships: []
      }
      status_mensal: {
        Row: {
          ano: number
          anotacoes: string | null
          cliente_id: string
          created_at: string
          data_fechamento: string | null
          forma_envio: string | null
          id: string
          integracao_fiscal: boolean
          integracao_fopag: boolean
          mes: string
          sem_movimento_fopag: boolean
          sm: boolean
          updated_at: string
        }
        Insert: {
          ano?: number
          anotacoes?: string | null
          cliente_id: string
          created_at?: string
          data_fechamento?: string | null
          forma_envio?: string | null
          id?: string
          integracao_fiscal?: boolean
          integracao_fopag?: boolean
          mes: string
          sem_movimento_fopag?: boolean
          sm?: boolean
          updated_at?: string
        }
        Update: {
          ano?: number
          anotacoes?: string | null
          cliente_id?: string
          created_at?: string
          data_fechamento?: string | null
          forma_envio?: string | null
          id?: string
          integracao_fiscal?: boolean
          integracao_fopag?: boolean
          mes?: string
          sem_movimento_fopag?: boolean
          sm?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_mensal_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
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
      colaborador_responsavel: "Sheila" | "Bruna" | "Nilcea" | "Natiele"
      regime_tributario: "Simples Nacional" | "Lucro Presumido" | "Lucro Real"
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
      colaborador_responsavel: ["Sheila", "Bruna", "Nilcea", "Natiele"],
      regime_tributario: ["Simples Nacional", "Lucro Presumido", "Lucro Real"],
    },
  },
} as const
