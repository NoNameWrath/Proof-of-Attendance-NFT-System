import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const setIsAdmin = useAppStore((s) => s.setIsAdmin);
  const navigate = useNavigate();

  async function checkAdmin(userObj) {
    if (!userObj) { setIsAdmin(false); return; }
    const { data } = await supabase
      .from('admins').select('email').eq('email', userObj.email).maybeSingle();
    setIsAdmin(!!data);
  }

  useEffect(() => {
    let mounted = true;

    // initial session
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        await checkAdmin(session?.user ?? null);
        setLoading(false);
      }
    })();

    // listen for changes (login, logout, refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/post-login`
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
