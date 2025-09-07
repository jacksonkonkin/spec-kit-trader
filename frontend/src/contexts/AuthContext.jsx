import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser, getSession, onAuthStateChange, signout } from '../services/auth.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: sessionData, error: sessionError } = await getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (sessionData?.session) {
          if (mounted) {
            setSession(sessionData.session);
            setUser(sessionData.session.user);
          }
        } else {
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setError(err);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session);
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Auth actions
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await signout();
      
      if (error) {
        console.error('Error signing out:', error);
        setError(error);
        return { error };
      }

      setUser(null);
      setSession(null);
      setError(null);
      return { error: null };
    } catch (err) {
      console.error('Error in logout:', err);
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    error,
    logout,
    clearError,
    isAuthenticated: !!user && !!session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};