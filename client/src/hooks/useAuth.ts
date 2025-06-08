import { useQuery } from "@tanstack/react-query";
import { initSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await initSupabase();
        if (!client) {
          setIsLoading(false);
          return;
        }
        
        setSupabaseClient(client);

        // Get initial session
        const { data: { session } } = await client.auth.getSession();
        setSession(session);
        setIsLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange((_event: any, session: any) => {
          setSession(session);
          setIsLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !supabaseClient) return null;
      
      const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (error) {
        console.log('Profile query error:', error);
        return null;
      }
      return data;
    },
    enabled: !!session?.user?.id && !!supabaseClient,
    retry: false,
  });

  return {
    user: profile,
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    supabaseClient,
  };
}
