import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from server
const getSupabaseConfig = async () => {
  try {
    const response = await fetch('/api/supabase-config');
    if (!response.ok) throw new Error('Failed to get Supabase config');
    return await response.json();
  } catch (error) {
    console.error('Error getting Supabase config:', error);
    // Fallback to environment variables if available
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      throw new Error('Supabase configuration not available');
    }
    
    return { url, anonKey };
  }
};

// Initialize with temporary client, will be replaced after config is loaded
let supabaseInstance: any = null;

const initSupabase = async () => {
  if (!supabaseInstance) {
    const config = await getSupabaseConfig();
    supabaseInstance = createClient(config.url, config.anonKey);
  }
  return supabaseInstance;
};

export const supabase = {
  auth: {
    getSession: async () => {
      const client = await initSupabase();
      return client.auth.getSession();
    },
    onAuthStateChange: async (callback: any) => {
      const client = await initSupabase();
      return client.auth.onAuthStateChange(callback);
    },
    signUp: async (credentials: any) => {
      const client = await initSupabase();
      return client.auth.signUp(credentials);
    },
    signInWithPassword: async (credentials: any) => {
      const client = await initSupabase();
      return client.auth.signInWithPassword(credentials);
    },
    signOut: async () => {
      const client = await initSupabase();
      return client.auth.signOut();
    },
  },
  from: async (table: string) => {
    const client = await initSupabase();
    return client.from(table);
  },
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