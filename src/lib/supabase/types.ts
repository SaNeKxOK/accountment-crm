export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          tax_id: string
          type: 'ФОП_1' | 'ФОП_2' | 'ФОП_3' | 'ТОВ' | 'ПП'
          tax_system: 'загальна' | 'спрощена'
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tax_id: string
          type: 'ФОП_1' | 'ФОП_2' | 'ФОП_3' | 'ТОВ' | 'ПП'
          tax_system: 'загальна' | 'спрощена'
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tax_id?: string
          type?: 'ФОП_1' | 'ФОП_2' | 'ФОП_3' | 'ТОВ' | 'ПП'
          tax_system?: 'загальна' | 'спрощена'
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      report_templates: {
        Row: {
          id: string
          name: string
          frequency: 'щомісячно' | 'щокварталу' | 'щорічно'
          deadline_day: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          frequency: 'щомісячно' | 'щокварталу' | 'щорічно'
          deadline_day: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          frequency?: 'щомісячно' | 'щокварталу' | 'щорічно'
          deadline_day?: number
          description?: string | null
          created_at?: string
        }
      }
      client_reports: {
        Row: {
          id: string
          client_id: string
          report_template_id: string | null
          custom_report_name: string | null
          due_date: string
          status: 'очікується' | 'в_роботі' | 'подано' | 'сплачено'
          price: number | null
          notes: string | null
          period: string | null
          submitted_date: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          report_template_id?: string | null
          custom_report_name?: string | null
          due_date: string
          status?: 'очікується' | 'в_роботі' | 'подано' | 'сплачено'
          price?: number | null
          notes?: string | null
          period?: string | null
          submitted_date?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          report_template_id?: string | null
          custom_report_name?: string | null
          due_date?: string
          status?: 'очікується' | 'в_роботі' | 'подано' | 'сплачено'
          price?: number | null
          notes?: string | null
          period?: string | null
          submitted_date?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      client_report_configs: {
        Row: {
          id: string
          client_id: string
          report_template_id: string
          price: number
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          report_template_id: string
          price: number
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          report_template_id?: string
          price?: number
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          client_id: string
          period: string
          amount: number
          status: 'сплачено' | 'не_сплачено'
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          period: string
          amount: number
          status?: 'сплачено' | 'не_сплачено'
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          period?: string
          amount?: number
          status?: 'сплачено' | 'не_сплачено'
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
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