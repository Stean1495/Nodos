import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://hjvuvntvzqxawnjkjloe.supabase.co'
const SUPABASE_ANON_KEY = 'tu_anon_key_completa'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
