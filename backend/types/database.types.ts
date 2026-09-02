export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          plan: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          plan?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          plan?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          current_org_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          current_org_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          current_org_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["org_role"];
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["org_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["org_role"];
          created_at?: string;
        };
        Relationships: [];
      };

      suppliers: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          category: string | null;
          contact_email: string | null;
          on_time_rate: number | null;
          status: string | null;
          next_delivery: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          category?: string | null;
          contact_email?: string | null;
          on_time_rate?: number | null;
          status?: string | null;
          next_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          category?: string | null;
          contact_email?: string | null;
          on_time_rate?: number | null;
          status?: string | null;
          next_delivery?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      products: {
        Row: {
          id: string;
          org_id: string;
          sku: string;
          name: string;
          brand: string | null;
          department: string | null;
          aisle: string | null;
          stock: number;
          capacity: number;
          velocity: Database["public"]["Enums"]["velocity"] | null;
          demand_trend: number | null;
          expires_at: string | null;
          last_received: string | null;
          unit_cost: number | null;
          supplier_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          sku: string;
          name: string;
          brand?: string | null;
          department?: string | null;
          aisle?: string | null;
          stock?: number;
          capacity?: number;
          velocity?: Database["public"]["Enums"]["velocity"] | null;
          demand_trend?: number | null;
          expires_at?: string | null;
          last_received?: string | null;
          unit_cost?: number | null;
          supplier_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          sku?: string;
          name?: string;
          brand?: string | null;
          department?: string | null;
          aisle?: string | null;
          stock?: number;
          capacity?: number;
          velocity?: Database["public"]["Enums"]["velocity"] | null;
          demand_trend?: number | null;
          expires_at?: string | null;
          last_received?: string | null;
          unit_cost?: number | null;
          supplier_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      stock_movements: {
        Row: {
          id: string;
          org_id: string;
          product_id: string;
          type: Database["public"]["Enums"]["stock_movement_type"];
          qty: number;
          actor_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          product_id: string;
          type: Database["public"]["Enums"]["stock_movement_type"];
          qty: number;
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          product_id?: string;
          type?: Database["public"]["Enums"]["stock_movement_type"];
          qty?: number;
          actor_id?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      purchase_orders: {
        Row: {
          id: string;
          org_id: string;
          supplier_id: string | null;
          status: Database["public"]["Enums"]["po_status"];
          total: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          supplier_id?: string | null;
          status?: Database["public"]["Enums"]["po_status"];
          total?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          supplier_id?: string | null;
          status?: Database["public"]["Enums"]["po_status"];
          total?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      purchase_order_items: {
        Row: {
          id: string;
          po_id: string;
          product_id: string;
          qty: number;
          unit_cost: number;
        };
        Insert: {
          id?: string;
          po_id: string;
          product_id: string;
          qty: number;
          unit_cost?: number;
        };
        Update: {
          id?: string;
          po_id?: string;
          product_id?: string;
          qty?: number;
          unit_cost?: number;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      create_organization: {
        Args: {
          _name: string;
        };
        Returns: string;
      };

      current_org_id: {
        Args: Record<string, never>;
        Returns: string;
      };

      has_org_role: {
        Args: {
          _org: string;
          _roles: Database["public"]["Enums"]["org_role"][];
        };
        Returns: boolean;
      };

      is_org_member: {
        Args: {
          _org: string;
        };
        Returns: boolean;
      };

      seed_demo_data: {
        Args: {
          _org: string;
        };
        Returns: undefined;
      };
    };

    Enums: {
      org_role: "owner" | "manager" | "staff";

      stock_movement_type:
        | "sale"
        | "receipt"
        | "waste"
        | "adjustment";

      po_status:
        | "draft"
        | "sent"
        | "received"
        | "cancelled";

      alert_kind:
        | "low_stock"
        | "expiring"
        | "stockout";

      velocity:
        | "High"
        | "Medium"
        | "Low";
    };

    CompositeTypes: Record<string, never>;
  };
};
