
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qvveymgzxherxqhlpbta.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dmV5bWd6eGhlcnhxaGxwYnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NjU1NjksImV4cCI6MjA1ODQ0MTU2OX0.l2Q7PX9UNDY94_uA92npsvu9zjqpS8-TtvccXyCfVWo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
// Note: This client is no longer used for blockchain data storage

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
