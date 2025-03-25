
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available, otherwise use mock implementation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Log Supabase configuration for debugging
console.log("Supabase client configuration:", {
  url: supabaseUrl,
  usingMock: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
});

// Create a mock Supabase client if environment variables are not provided
const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client with explicit auth settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

// If using mock, replace the methods we need with mock implementations
if (isMock) {
  console.warn("Using mock Supabase client. For production use, please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.");
  
  // Mock implementation for blockchain_readings table
  const mockData: Record<string, any[]> = {
    blockchain_readings: []
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
            })
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
}
