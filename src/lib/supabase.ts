
import { createClient } from '@supabase/supabase-js';

// Use the hardcoded values from the integrations file as fallbacks
const FALLBACK_URL = "https://qvveymgzxherxqhlpbta.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dmV5bWd6eGhlcnhxaGxwYnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NjU1NjksImV4cCI6MjA1ODQ0MTU2OX0.l2Q7PX9UNDY94_uA92npsvu9zjqpS8-TtvccXyCfVWo";

// Check if environment variables are available, otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Log Supabase configuration for debugging
console.log("Supabase client configuration:", {
  url: supabaseUrl,
  key: "Key is set (not showing full key)",
  usingFallback: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
});

// Check if we're using a mock implementation
const isMock = supabaseUrl === 'https://mock.supabase.co';

// Create the Supabase client with explicit auth settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
  }
});

// If using mock, replace the methods we need with mock implementations
if (isMock) {
  console.warn("Using mock Supabase client. For production use, please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
  
  // Mock implementation for blockchain_readings table
  const mockData: Record<string, any[]> = {
    blockchain_readings: [],
    user_roles: [{ user_id: '4f932e7f-20df-49b8-a6de-442fbb0c37c5', role: 'admin' }]
  };

  // Override the from method to return our mock implementation
  const originalFrom = supabase.from;
  supabase.from = (table: string) => {
    if (isMock) {
      return {
        select: () => ({
          eq: () => ({
            gte: () => ({
              order: () => ({
                then: (callback: (result: { data: any[], error: null }) => void) => {
                  setTimeout(() => {
                    callback({ data: mockData[table] || [], error: null });
                  }, 100);
                  return Promise.resolve({ data: mockData[table] || [], error: null });
                }
              })
            }),
            maybeSingle: () => {
              return Promise.resolve({
                data: (table === 'user_roles' && mockData[table]?.length) ? mockData[table][0] : null,
                error: null
              });
            }
          })
        }),
        insert: (data: any) => {
          if (!mockData[table]) {
            mockData[table] = [];
          }
          
          mockData[table].push(data);
          
          return {
            then: (callback: (result: { error: null }) => void) => {
              setTimeout(() => {
                callback({ error: null });
              }, 100);
              return Promise.resolve({ error: null });
            }
          };
        }
      } as any;
    }
    return originalFrom(table);
  };

  // Add a mock auth implementation
  const mockSession = {
    user: { id: '4f932e7f-20df-49b8-a6de-442fbb0c37c5', email: 'admin@example.com' },
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() + 3600000
  };

  // Override auth methods
  const originalAuth = supabase.auth;
  supabase.auth = {
    ...originalAuth,
    signInWithPassword: ({ email, password }: { email: string; password: string }) => {
      if (email === 'admin@example.com' && password === 'password') {
        return Promise.resolve({ data: { session: mockSession, user: mockSession.user }, error: null });
      }
      return Promise.resolve({ data: { session: null, user: null }, error: { message: 'Invalid login credentials' } });
    },
    getSession: () => {
      return Promise.resolve({ data: { session: mockSession }, error: null });
    },
    onAuthStateChange: (callback: any) => {
      setTimeout(() => {
        callback('SIGNED_IN', mockSession);
      }, 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  } as any;
}
