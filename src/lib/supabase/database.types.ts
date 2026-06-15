export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      availability_slots: {
        Row: {
          booking_id: string | null;
          id: string;
          is_available: boolean;
          postal_code_prefix: string | null;
          service_slug: string;
          slot_date: string;
          start_time: string;
        };
        Insert: {
          booking_id?: string | null;
          id?: string;
          is_available?: boolean;
          postal_code_prefix?: string | null;
          service_slug?: string;
          slot_date: string;
          start_time: string;
        };
        Update: {
          booking_id?: string | null;
          id?: string;
          is_available?: boolean;
          postal_code_prefix?: string | null;
          service_slug?: string;
          slot_date?: string;
          start_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slots_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_status_events: {
        Row: {
          booking_id: string;
          created_at: string;
          id: string;
          note: string | null;
          status: Database["public"]["Enums"]["booking_status"];
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          status: Database["public"]["Enums"]["booking_status"];
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
        };
        Relationships: [
          {
            foreignKeyName: "booking_status_events_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"];
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          created_at: string;
          id: string;
          message: string | null;
          municipality: string;
          postal_code: string;
          profile_id: string | null;
          service_slug: string;
          source: string;
          source_lead_id: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          street_address: string | null;
          updated_at: string;
        };
        Insert: {
          booking_type: Database["public"]["Enums"]["booking_type"];
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          created_at?: string;
          id?: string;
          message?: string | null;
          municipality: string;
          postal_code: string;
          profile_id?: string | null;
          service_slug: string;
          source?: string;
          source_lead_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          street_address?: string | null;
          updated_at?: string;
        };
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"];
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string;
          created_at?: string;
          id?: string;
          message?: string | null;
          municipality?: string;
          postal_code?: string;
          profile_id?: string | null;
          service_slug?: string;
          source?: string;
          source_lead_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          street_address?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cleaning_booking_details: {
        Row: {
          admin_fixed_price_ore: number | null;
          admin_pricing_mode: string | null;
          booking_id: string;
          booking_path: string;
          contact_preference: string | null;
          frequency: string;
          has_pets: boolean;
          key_access: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          pricing_breakdown: Json | null;
          quoted_monthly_price_ore: number | null;
          square_meters: number;
          tidying: string;
          weekday_preference: string;
        };
        Insert: {
          admin_fixed_price_ore?: number | null;
          admin_pricing_mode?: string | null;
          booking_id: string;
          booking_path: string;
          contact_preference?: string | null;
          frequency: string;
          has_pets: boolean;
          key_access?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          pricing_breakdown?: Json | null;
          quoted_monthly_price_ore?: number | null;
          square_meters: number;
          tidying: string;
          weekday_preference: string;
        };
        Update: {
          admin_fixed_price_ore?: number | null;
          admin_pricing_mode?: string | null;
          booking_id?: string;
          booking_path?: string;
          contact_preference?: string | null;
          frequency?: string;
          has_pets?: boolean;
          key_access?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          pricing_breakdown?: Json | null;
          quoted_monthly_price_ore?: number | null;
          square_meters?: number;
          tidying?: string;
          weekday_preference?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cleaning_booking_details_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      cleaning_visits: {
        Row: {
          booking_id: string;
          created_at: string;
          duration_minutes: number;
          id: string;
          note: string | null;
          sequence_number: number;
          staff_id: string | null;
          status: Database["public"]["Enums"]["cleaning_visit_status"];
          updated_at: string;
          visit_date: string;
          visit_time: string;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          note?: string | null;
          sequence_number?: number;
          staff_id?: string | null;
          status?: Database["public"]["Enums"]["cleaning_visit_status"];
          updated_at?: string;
          visit_date: string;
          visit_time: string;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          note?: string | null;
          sequence_number?: number;
          staff_id?: string | null;
          status?: Database["public"]["Enums"]["cleaning_visit_status"];
          updated_at?: string;
          visit_date?: string;
          visit_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cleaning_visits_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cleaning_visits_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cleaning_lead_details: {
        Row: {
          contact_preference: string | null;
          frequency: string;
          has_pets: boolean;
          lead_id: string;
          property_type: string | null;
          square_meters: number;
          tidying: string;
          weekday_preference: string;
        };
        Insert: {
          contact_preference?: string | null;
          frequency: string;
          has_pets?: boolean;
          lead_id: string;
          property_type?: string | null;
          square_meters: number;
          tidying: string;
          weekday_preference: string;
        };
        Update: {
          contact_preference?: string | null;
          frequency?: string;
          has_pets?: boolean;
          lead_id?: string;
          property_type?: string | null;
          square_meters?: number;
          tidying?: string;
          weekday_preference?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cleaning_lead_details_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: true;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          converted_booking_id: string | null;
          created_at: string;
          id: string;
          lead_type: Database["public"]["Enums"]["lead_type"];
          message: string | null;
          municipality: string;
          postal_code: string;
          profile_id: string | null;
          service_slug: string;
          source: string;
          status: Database["public"]["Enums"]["lead_status"];
          street_address: string | null;
          updated_at: string;
        };
        Insert: {
          contact_email: string;
          contact_name: string;
          contact_phone: string;
          converted_booking_id?: string | null;
          created_at?: string;
          id?: string;
          lead_type: Database["public"]["Enums"]["lead_type"];
          message?: string | null;
          municipality: string;
          postal_code: string;
          profile_id?: string | null;
          service_slug: string;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          street_address?: string | null;
          updated_at?: string;
        };
        Update: {
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string;
          converted_booking_id?: string | null;
          created_at?: string;
          id?: string;
          lead_type?: Database["public"]["Enums"]["lead_type"];
          message?: string | null;
          municipality?: string;
          postal_code?: string;
          profile_id?: string | null;
          service_slug?: string;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
          street_address?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_converted_booking_id_fkey";
            columns: ["converted_booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      service_lead_details: {
        Row: {
          lead_id: string;
          timeframe: string;
        };
        Insert: {
          lead_id: string;
          timeframe?: string;
        };
        Update: {
          lead_id?: string;
          timeframe?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_lead_details_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: true;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      customer_addresses: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          label: string;
          municipality: string;
          postal_code: string;
          profile_id: string;
          street_address: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          label?: string;
          municipality: string;
          postal_code: string;
          profile_id: string;
          street_address: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          label?: string;
          municipality?: string;
          postal_code?: string;
          profile_id?: string;
          street_address?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_addresses_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      job_assignments: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          booking_id: string;
          id: string;
          staff_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          booking_id: string;
          id?: string;
          staff_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          booking_id?: string;
          id?: string;
          staff_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_assignments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_assignments_staff_id_fkey";
            columns: ["staff_id"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_areas: {
        Row: {
          is_active: boolean;
          last_verified_at: string;
          municipality: string;
          postal_code: string;
        };
        Insert: {
          is_active?: boolean;
          last_verified_at?: string;
          municipality: string;
          postal_code: string;
        };
        Update: {
          is_active?: boolean;
          last_verified_at?: string;
          municipality?: string;
          postal_code?: string;
        };
        Relationships: [];
      };
      service_inquiry_details: {
        Row: {
          admin_fixed_price_ore: number | null;
          admin_pricing_mode: string | null;
          booking_id: string;
          timeframe: string;
        };
        Insert: {
          admin_fixed_price_ore?: number | null;
          admin_pricing_mode?: string | null;
          booking_id: string;
          timeframe?: string;
        };
        Update: {
          admin_fixed_price_ore?: number | null;
          admin_pricing_mode?: string | null;
          booking_id?: string;
          timeframe?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_inquiry_details_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      weekly_availability: {
        Row: {
          created_at: string;
          id: string;
          service_slug: string;
          start_time: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          service_slug?: string;
          start_time: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          service_slug?: string;
          start_time?: string;
          weekday?: number;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          invited_by: string | null;
          is_active: boolean;
          job_title: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["team_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          invited_by?: string | null;
          is_active?: boolean;
          job_title?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["team_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          invited_by?: string | null;
          is_active?: boolean;
          job_title?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["team_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      is_staff_or_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      booking_status:
        | "submitted"
        | "contacted"
        | "confirmed"
        | "cancelled"
        | "completed";
      booking_type: "cleaning_direct" | "cleaning_expert" | "service_inquiry" | "service_booking";
      cleaning_visit_status: "scheduled" | "completed" | "cancelled" | "skipped";
      lead_status: "submitted" | "contacted" | "converted" | "cancelled";
      lead_type: "cleaning_expert" | "service_inquiry";
      team_role: "admin" | "staff";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "submitted",
        "contacted",
        "confirmed",
        "cancelled",
        "completed",
      ],
      booking_type: ["cleaning_direct", "cleaning_expert", "service_inquiry", "service_booking"],
      cleaning_visit_status: ["scheduled", "completed", "cancelled", "skipped"],
      lead_status: ["submitted", "contacted", "converted", "cancelled"],
      lead_type: ["cleaning_expert", "service_inquiry"],
      team_role: ["admin", "staff"],
    },
  },
} as const;
