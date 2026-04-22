import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rgvpowbctdrbxmdyxlbk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndnBvd2JjdGRyYnhtZHl4bGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzIwNzgsImV4cCI6MjA5MjM0ODA3OH0.PIGNWM5_mEqugJklFLL-kjiKvREJYzJz910YHRrE5CM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);