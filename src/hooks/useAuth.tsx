import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'student' | 'support' | 'admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Fetch role after auth state change
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, role: null, loading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Default to student if no role found
        setAuthState(prev => ({ ...prev, role: 'student', loading: false }));
        return;
      }

      setAuthState(prev => ({ 
        ...prev, 
        role: data?.role as AppRole || 'student',
        loading: false 
      }));
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setAuthState(prev => ({ ...prev, role: 'student', loading: false }));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthState({ user: null, session: null, role: null, loading: false });
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.session,
  };
};
