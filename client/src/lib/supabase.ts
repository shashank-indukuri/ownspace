import { createClient } from '@supabase/supabase-js';

// For now, use placeholders that will be replaced by the server config
// This will be updated after the server provides the actual configuration
export let supabase: any = null;

// Initialize Supabase client with config from server
export const initSupabase = async () => {
  if (!supabase) {
    try {
      const response = await fetch('/api/supabase-config');
      const config = await response.json();
      supabase = createClient(config.url, config.anonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
    }
  }
  return supabase;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          profile_image_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      weddings: {
        Row: {
          id: number;
          user_id: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string;
          venue: string;
          venue_address: string | null;
          description: string | null;
          status: string;
          rsvp_code: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string;
          venue: string;
          venue_address?: string | null;
          description?: string | null;
          status?: string;
          rsvp_code: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          bride_name?: string;
          groom_name?: string;
          wedding_date?: string;
          venue?: string;
          venue_address?: string | null;
          description?: string | null;
          status?: string;
          rsvp_code?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
};