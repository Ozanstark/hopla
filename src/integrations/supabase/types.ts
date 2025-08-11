export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_buttons: {
        Row: {
          bot_response: string
          category: string | null
          created_at: string | null
          emoji: string
          id: string
          label: string
          media_url: string | null
          order: number
        }
        Insert: {
          bot_response: string
          category?: string | null
          created_at?: string | null
          emoji: string
          id?: string
          label: string
          media_url?: string | null
          order: number
        }
        Update: {
          bot_response?: string
          category?: string | null
          created_at?: string | null
          emoji?: string
          id?: string
          label?: string
          media_url?: string | null
          order?: number
        }
        Relationships: []
      }
      chat_modes: {
        Row: {
          background_color: string | null
          created_at: string | null
          description: string
          emoji_style: string | null
          id: string
          is_active: boolean | null
          label: string
          slug: string
          system_prompt: string
          text_style: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          description: string
          emoji_style?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          slug: string
          system_prompt: string
          text_style?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          description?: string
          emoji_style?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          slug?: string
          system_prompt?: string
          text_style?: string | null
        }
        Relationships: []
      }
      concepts: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_id: number | null
          image_url: string | null
          label: string | null
          linked_to: string[] | null
          order_index: number | null
          slug: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image_id?: number | null
          image_url?: string | null
          label?: string | null
          linked_to?: string[] | null
          order_index?: number | null
          slug: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_id?: number | null
          image_url?: string | null
          label?: string | null
          linked_to?: string[] | null
          order_index?: number | null
          slug?: string
        }
        Relationships: []
      }
      download_counts: {
        Row: {
          count: number
          file_name: string
          id: string
          updated_at: string
        }
        Insert: {
          count?: number
          file_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          count?: number
          file_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      emoji_interactions: {
        Row: {
          bot_response: string
          category: string
          created_at: string | null
          id: string
          next_options: Json | null
          sound_enabled: boolean | null
          trigger_emoji: string
        }
        Insert: {
          bot_response: string
          category: string
          created_at?: string | null
          id?: string
          next_options?: Json | null
          sound_enabled?: boolean | null
          trigger_emoji: string
        }
        Update: {
          bot_response?: string
          category?: string
          created_at?: string | null
          id?: string
          next_options?: Json | null
          sound_enabled?: boolean | null
          trigger_emoji?: string
        }
        Relationships: []
      }
      emotion_buttons: {
        Row: {
          category: string | null
          created_at: string | null
          emoji: string
          follow_up_prompt: string
          id: string
          label: string
          options: Json | null
          order: number
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          emoji: string
          follow_up_prompt: string
          id?: string
          label: string
          options?: Json | null
          order: number
        }
        Update: {
          category?: string | null
          created_at?: string | null
          emoji?: string
          follow_up_prompt?: string
          id?: string
          label?: string
          options?: Json | null
          order?: number
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          created_at: string
          id: string
          player_name: string
          score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_name: string
          score: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          player_name?: string
          score?: number
          updated_at?: string
        }
        Relationships: []
      }
      mod_suggestions: {
        Row: {
          created_at: string | null
          id: string
          keywords: string[]
          priority: number
          reason: string
          suggest_mode: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keywords: string[]
          priority?: number
          reason: string
          suggest_mode: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keywords?: string[]
          priority?: number
          reason?: string
          suggest_mode?: string
        }
        Relationships: []
      }
      mode_switch_logs: {
        Row: {
          accepted: boolean
          id: string
          previous_mode: string
          source: string
          suggested_mode: string
          timestamp: string | null
          trigger_message: string | null
          user_id: string | null
        }
        Insert: {
          accepted: boolean
          id?: string
          previous_mode: string
          source: string
          suggested_mode: string
          timestamp?: string | null
          trigger_message?: string | null
          user_id?: string | null
        }
        Update: {
          accepted?: boolean
          id?: string
          previous_mode?: string
          source?: string
          suggested_mode?: string
          timestamp?: string | null
          trigger_message?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      need_buttons: {
        Row: {
          bot_response: string
          category: string | null
          created_at: string | null
          emoji: string
          id: string
          label: string
          options: Json | null
          order: number
        }
        Insert: {
          bot_response: string
          category?: string | null
          created_at?: string | null
          emoji: string
          id?: string
          label: string
          options?: Json | null
          order: number
        }
        Update: {
          bot_response?: string
          category?: string | null
          created_at?: string | null
          emoji?: string
          id?: string
          label?: string
          options?: Json | null
          order?: number
        }
        Relationships: []
      }
      planner_activities: {
        Row: {
          category: string
          created_at: string
          day_index: number
          icon: string
          id: string
          label: string
          time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          day_index: number
          icon: string
          id?: string
          label: string
          time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          day_index?: number
          icon?: string
          id?: string
          label?: string
          time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          condition_level: string | null
          condition_type: string | null
          created_at: string
          display_name: string | null
          id: string
          interests: string[] | null
          parent_email: string | null
          parent_name: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          condition_level?: string | null
          condition_type?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          interests?: string[] | null
          parent_email?: string | null
          parent_name?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          condition_level?: string | null
          condition_type?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          interests?: string[] | null
          parent_email?: string | null
          parent_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      question_templates: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          options: string[] | null
          order_index: number | null
          prompt_text: string | null
          slug: string
          tts_text: string | null
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          options?: string[] | null
          order_index?: number | null
          prompt_text?: string | null
          slug: string
          tts_text?: string | null
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          options?: string[] | null
          order_index?: number | null
          prompt_text?: string | null
          slug?: string
          tts_text?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          is_completed: boolean
          notes: string | null
          priority: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          priority?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          priority?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_history: {
        Row: {
          id: string
          selected_at: string | null
          selected_slug: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          selected_at?: string | null
          selected_slug?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          selected_at?: string | null
          selected_slug?: string | null
          user_id?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
