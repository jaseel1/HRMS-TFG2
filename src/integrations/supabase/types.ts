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
      announcement_banners: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          message: string
          position: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          position?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      approval_workflows: {
        Row: {
          applicant_role: Database["public"]["Enums"]["app_role"] | null
          approval_chain: Database["public"]["Enums"]["app_role"][]
          created_at: string
          department_id: string | null
          id: string
          is_active: boolean
          leave_type_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          applicant_role?: Database["public"]["Enums"]["app_role"] | null
          approval_chain: Database["public"]["Enums"]["app_role"][]
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          leave_type_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          applicant_role?: Database["public"]["Enums"]["app_role"] | null
          approval_chain?: Database["public"]["Enums"]["app_role"][]
          created_at?: string
          department_id?: string | null
          id?: string
          is_active?: boolean
          leave_type_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      compensatory_offs: {
        Row: {
          created_at: string
          employee_id: string
          expires_at: string
          granted_by_id: string
          id: string
          is_used: boolean
          leave_application_id: string | null
          worked_date: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          expires_at: string
          granted_by_id: string
          id?: string
          is_used?: boolean
          leave_application_id?: string | null
          worked_date: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          expires_at?: string
          granted_by_id?: string
          id?: string
          is_used?: boolean
          leave_application_id?: string | null
          worked_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "compensatory_offs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensatory_offs_granted_by_id_fkey"
            columns: ["granted_by_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensatory_offs_leave_application_id_fkey"
            columns: ["leave_application_id"]
            isOneToOne: false
            referencedRelation: "leave_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          about_me: string | null
          blood_group: string | null
          cpp_acknowledged_at: string | null
          created_at: string
          created_by: string | null
          current_address: string | null
          date_of_joining: string
          department_id: string | null
          designation: string | null
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          employee_id: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          gender: Database["public"]["Enums"]["gender"] | null
          handbook_acknowledged_at: string | null
          id: string
          is_active: boolean
          last_modified_by: string | null
          leave_policy_acknowledged_at: string | null
          linkedin_url: string | null
          permanent_address: string | null
          personal_email: string | null
          posh_policy_acknowledged_at: string | null
          probation_end_date: string | null
          reporting_manager_id: string | null
          state: string | null
          updated_at: string
          user_id: string | null
          work_location: string | null
          work_mode: string | null
        }
        Insert: {
          about_me?: string | null
          blood_group?: string | null
          cpp_acknowledged_at?: string | null
          created_at?: string
          created_by?: string | null
          current_address?: string | null
          date_of_joining: string
          department_id?: string | null
          designation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          employee_id: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          gender?: Database["public"]["Enums"]["gender"] | null
          handbook_acknowledged_at?: string | null
          id?: string
          is_active?: boolean
          last_modified_by?: string | null
          leave_policy_acknowledged_at?: string | null
          linkedin_url?: string | null
          permanent_address?: string | null
          personal_email?: string | null
          posh_policy_acknowledged_at?: string | null
          probation_end_date?: string | null
          reporting_manager_id?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          work_location?: string | null
          work_mode?: string | null
        }
        Update: {
          about_me?: string | null
          blood_group?: string | null
          cpp_acknowledged_at?: string | null
          created_at?: string
          created_by?: string | null
          current_address?: string | null
          date_of_joining?: string
          department_id?: string | null
          designation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_number?: string | null
          employee_id?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          gender?: Database["public"]["Enums"]["gender"] | null
          handbook_acknowledged_at?: string | null
          id?: string
          is_active?: boolean
          last_modified_by?: string | null
          leave_policy_acknowledged_at?: string | null
          linkedin_url?: string | null
          permanent_address?: string | null
          personal_email?: string | null
          posh_policy_acknowledged_at?: string | null
          probation_end_date?: string | null
          reporting_manager_id?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
          work_location?: string | null
          work_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string
          date: string
          holiday_type: Database["public"]["Enums"]["holiday_type"] | null
          id: string
          is_national: boolean
          is_optional: boolean
          name: string
          states: string[] | null
          year: number
        }
        Insert: {
          created_at?: string
          date: string
          holiday_type?: Database["public"]["Enums"]["holiday_type"] | null
          id?: string
          is_national?: boolean
          is_optional?: boolean
          name: string
          states?: string[] | null
          year: number
        }
        Update: {
          created_at?: string
          date?: string
          holiday_type?: Database["public"]["Enums"]["holiday_type"] | null
          id?: string
          is_national?: boolean
          is_optional?: boolean
          name?: string
          states?: string[] | null
          year?: number
        }
        Relationships: []
      }
      leave_applications: {
        Row: {
          attachment_url: string | null
          created_at: string
          current_approver_role: Database["public"]["Enums"]["app_role"] | null
          days_count: number
          employee_id: string
          end_date: string
          id: string
          is_lop: boolean
          leave_type_id: string
          lop_days: number | null
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          current_approver_role?: Database["public"]["Enums"]["app_role"] | null
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          is_lop?: boolean
          leave_type_id: string
          lop_days?: number | null
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          current_approver_role?: Database["public"]["Enums"]["app_role"] | null
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          is_lop?: boolean
          leave_type_id?: string
          lop_days?: number | null
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_applications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string
          approver_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          id: string
          leave_application_id: string
          remarks: string | null
          status: Database["public"]["Enums"]["leave_status"]
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          approver_role: Database["public"]["Enums"]["app_role"]
          created_at?: string
          id?: string
          leave_application_id: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["leave_status"]
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          approver_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          id?: string
          leave_application_id?: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["leave_status"]
        }
        Relationships: [
          {
            foreignKeyName: "leave_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_approvals_leave_application_id_fkey"
            columns: ["leave_application_id"]
            isOneToOne: false
            referencedRelation: "leave_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          adjusted_days: number
          carried_forward_days: number
          created_at: string
          employee_id: string
          entitled_days: number
          id: string
          leave_type_id: string
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          adjusted_days?: number
          carried_forward_days?: number
          created_at?: string
          employee_id: string
          entitled_days?: number
          id?: string
          leave_type_id: string
          updated_at?: string
          used_days?: number
          year: number
        }
        Update: {
          adjusted_days?: number
          carried_forward_days?: number
          created_at?: string
          employee_id?: string
          entitled_days?: number
          id?: string
          leave_type_id?: string
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          accrual_rate: number | null
          accrual_type: Database["public"]["Enums"]["accrual_type"]
          advance_notice_days: number | null
          auto_expiry_days: number | null
          carry_forward: boolean
          category: Database["public"]["Enums"]["leave_category"]
          code: string
          created_at: string
          description: string | null
          encashment: boolean
          entitlement_days: number
          gender_specific: Database["public"]["Enums"]["gender"] | null
          id: string
          is_enabled: boolean
          max_carry_forward_days: number | null
          max_days_per_month: number | null
          max_days_per_year: number | null
          medical_proof_required_after_days: number | null
          name: string
          post_probation_only: boolean
          requires_approval: boolean
          updated_at: string
        }
        Insert: {
          accrual_rate?: number | null
          accrual_type?: Database["public"]["Enums"]["accrual_type"]
          advance_notice_days?: number | null
          auto_expiry_days?: number | null
          carry_forward?: boolean
          category?: Database["public"]["Enums"]["leave_category"]
          code: string
          created_at?: string
          description?: string | null
          encashment?: boolean
          entitlement_days?: number
          gender_specific?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_enabled?: boolean
          max_carry_forward_days?: number | null
          max_days_per_month?: number | null
          max_days_per_year?: number | null
          medical_proof_required_after_days?: number | null
          name: string
          post_probation_only?: boolean
          requires_approval?: boolean
          updated_at?: string
        }
        Update: {
          accrual_rate?: number | null
          accrual_type?: Database["public"]["Enums"]["accrual_type"]
          advance_notice_days?: number | null
          auto_expiry_days?: number | null
          carry_forward?: boolean
          category?: Database["public"]["Enums"]["leave_category"]
          code?: string
          created_at?: string
          description?: string | null
          encashment?: boolean
          entitlement_days?: number
          gender_specific?: Database["public"]["Enums"]["gender"] | null
          id?: string
          is_enabled?: boolean
          max_carry_forward_days?: number | null
          max_days_per_month?: number | null
          max_days_per_year?: number | null
          medical_proof_required_after_days?: number | null
          name?: string
          post_probation_only?: boolean
          requires_approval?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          leave_approved: boolean
          leave_rejected: boolean
          low_balance_alert: boolean
          new_leave_request: boolean
          probation_ending: boolean
          upcoming_holiday: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leave_approved?: boolean
          leave_rejected?: boolean
          low_balance_alert?: boolean
          new_leave_request?: boolean
          probation_ending?: boolean
          upcoming_holiday?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leave_approved?: boolean
          leave_rejected?: boolean
          low_balance_alert?: boolean
          new_leave_request?: boolean
          probation_ending?: boolean
          upcoming_holiday?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          address: string | null
          cpp_url: string | null
          created_at: string
          email: string | null
          employee_handbook_url: string | null
          fiscal_year_start: string | null
          id: string
          leave_policy_url: string | null
          name: string
          posh_policy_url: string | null
          updated_at: string
          working_days: string | null
        }
        Insert: {
          address?: string | null
          cpp_url?: string | null
          created_at?: string
          email?: string | null
          employee_handbook_url?: string | null
          fiscal_year_start?: string | null
          id?: string
          leave_policy_url?: string | null
          name?: string
          posh_policy_url?: string | null
          updated_at?: string
          working_days?: string | null
        }
        Update: {
          address?: string | null
          cpp_url?: string | null
          created_at?: string
          email?: string | null
          employee_handbook_url?: string | null
          fiscal_year_start?: string | null
          id?: string
          leave_policy_url?: string | null
          name?: string
          posh_policy_url?: string | null
          updated_at?: string
          working_days?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      initialize_yearly_balances: {
        Args: { target_year?: number }
        Returns: undefined
      }
      is_admin_or_hr: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      accrual_type: "yearly" | "monthly" | "per_working_days" | "none"
      app_role: "admin" | "hr" | "finance" | "manager" | "team_member"
      employment_type: "full_time" | "part_time" | "contract"
      gender: "male" | "female" | "other"
      holiday_type: "national" | "company" | "regional"
      leave_category:
        | "regular"
        | "wellness"
        | "special"
        | "statutory"
        | "compensatory"
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
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
      accrual_type: ["yearly", "monthly", "per_working_days", "none"],
      app_role: ["admin", "hr", "finance", "manager", "team_member"],
      employment_type: ["full_time", "part_time", "contract"],
      gender: ["male", "female", "other"],
      holiday_type: ["national", "company", "regional"],
      leave_category: [
        "regular",
        "wellness",
        "special",
        "statutory",
        "compensatory",
      ],
      leave_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const
