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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null
          doubt_id: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          doubt_id: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          doubt_id?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          created_at: string | null
          description: string
          for_role: Database["public"]["Enums"]["app_role"]
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          created_at?: string | null
          description: string
          for_role: Database["public"]["Enums"]["app_role"]
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          created_at?: string | null
          description?: string
          for_role?: Database["public"]["Enums"]["app_role"]
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      doubt_responses: {
        Row: {
          created_at: string | null
          doubt_id: string
          id: string
          responder_id: string
          response_text: string | null
          response_type: string | null
        }
        Insert: {
          created_at?: string | null
          doubt_id: string
          id?: string
          responder_id: string
          response_text?: string | null
          response_type?: string | null
        }
        Update: {
          created_at?: string | null
          doubt_id?: string
          id?: string
          responder_id?: string
          response_text?: string | null
          response_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubt_responses_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubts: {
        Row: {
          assigned_support_id: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          escalated_at: string | null
          id: string
          priority: number | null
          reopened_count: number | null
          resolved_at: string | null
          sla_deadline: string | null
          status: Database["public"]["Enums"]["doubt_status"] | null
          student_id: string
          submitted_at: string | null
          title: string
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_support_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          escalated_at?: string | null
          id?: string
          priority?: number | null
          reopened_count?: number | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["doubt_status"] | null
          student_id: string
          submitted_at?: string | null
          title: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_support_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          escalated_at?: string | null
          id?: string
          priority?: number | null
          reopened_count?: number | null
          resolved_at?: string | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["doubt_status"] | null
          student_id?: string
          submitted_at?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doubts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_tracking: {
        Row: {
          created_at: string | null
          date: string
          doubts_resolved: number | null
          doubts_submitted: number | null
          id: string
          learning_minutes: number | null
          self_research_count: number | null
          streak_days: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          doubts_resolved?: number | null
          doubts_submitted?: number | null
          id?: string
          learning_minutes?: number | null
          self_research_count?: number | null
          streak_days?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          doubts_resolved?: number | null
          doubts_submitted?: number | null
          id?: string
          learning_minutes?: number | null
          self_research_count?: number | null
          streak_days?: number | null
          user_id?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          doubt_id: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          doubt_id?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          doubt_id?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          attempts: number | null
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          otp_code: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module_id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id: string
          name: string
          order_index?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string
          name?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          awarded_by: string | null
          badge_id: string
          doubt_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          awarded_by?: string | null
          badge_id: string
          doubt_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          awarded_by?: string | null
          badge_id?: string
          doubt_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_otps: { Args: never; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "support" | "admin"
      badge_type:
        | "verified_doubt"
        | "learning_streak"
        | "complex_solver"
        | "fast_resolution"
        | "high_satisfaction"
        | "complex_handler"
      doubt_status:
        | "submitted"
        | "in_progress"
        | "resolved"
        | "closed"
        | "escalated"
        | "closed_auto"
        | "reopened"
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
      app_role: ["student", "support", "admin"],
      badge_type: [
        "verified_doubt",
        "learning_streak",
        "complex_solver",
        "fast_resolution",
        "high_satisfaction",
        "complex_handler",
      ],
      doubt_status: [
        "submitted",
        "in_progress",
        "resolved",
        "closed",
        "escalated",
        "closed_auto",
        "reopened",
      ],
    },
  },
} as const
