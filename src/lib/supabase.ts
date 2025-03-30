
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available, otherwise use mock implementation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

// Create a mock Supabase client if environment variables are not provided
const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Note: This Supabase client is kept for potential future use, 
// but it's no longer used for blockchain data storage
