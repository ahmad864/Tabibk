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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          patient_name: string
          patient_phone: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          patient_name: string
          patient_phone: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          patient_name?: string
          patient_phone?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_requests: {
        Row: {
          avatar_url: string | null
          certificate_url: string | null
          city: string | null
          clinic_address: string | null
          created_at: string
          full_name: string
          id: string
          phone: string
          reviewed_by: string | null
          specialization: string
          status: Database["public"]["Enums"]["doctor_request_status"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          certificate_url?: string | null
          city?: string | null
          clinic_address?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone: string
          reviewed_by?: string | null
          specialization: string
          status?: Database["public"]["Enums"]["doctor_request_status"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          certificate_url?: string | null
          city?: string | null
          clinic_address?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          reviewed_by?: string | null
          specialization?: string
          status?: Database["public"]["Enums"]["doctor_request_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      doctor_slots: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          id: string
          slot_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          id?: string
          slot_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          id?: string
          slot_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certificate_url: string | null
          city: string | null
          clinic_address: string | null
          created_at: string
          diseases_treated: string[] | null
          full_name: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          is_featured: boolean | null
          phone: string
          rating: number | null
          rating_count: number | null
          slot_duration_minutes: number | null
          specialization: string
          updated_at: string
          user_id: string | null
          working_days: number[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certificate_url?: string | null
          city?: string | null
          clinic_address?: string | null
          created_at?: string
          diseases_treated?: string[] | null
          full_name: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          phone: string
          rating?: number | null
          rating_count?: number | null
          slot_duration_minutes?: number | null
          specialization: string
          updated_at?: string
          user_id?: string | null
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certificate_url?: string | null
          city?: string | null
          clinic_address?: string | null
          created_at?: string
          diseases_treated?: string[] | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          phone?: string
          rating?: number | null
          rating_count?: number | null
          slot_duration_minutes?: number | null
          specialization?: string
          updated_at?: string
          user_id?: string | null
          working_days?: number[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          patient_name: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          patient_name: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          patient_name?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_logs: {
        Row: {
          created_at: string
          id: string
          matched_illness: string | null
          matched_specialization: string | null
          patient_id: string | null
          symptoms: string
        }
        Insert: {
          created_at?: string
          id?: string
          matched_illness?: string | null
          matched_specialization?: string | null
          patient_id?: string | null
          symptoms: string
        }
        Update: {
          created_at?: string
          id?: string
          matched_illness?: string | null
          matched_specialization?: string | null
          patient_id?: string | null
          symptoms?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "doctor" | "patient"
      appointment_status: "pending" | "confirmed" | "rejected" | "cancelled"
      doctor_request_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "doctor", "patient"],
      appointment_status: ["pending", "confirmed", "rejected", "cancelled"],
      doctor_request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
