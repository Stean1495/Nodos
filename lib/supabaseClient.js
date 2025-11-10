import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://hjvuvntvzqxawnjkjloe.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdnV2bnR2enF4YXduamtqbG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MDk4MDcsImV4cCI6MjA3ODI4NTgwN30.0H2WnXWJ7cxXQIf7AcqRI9k6NHs5YZiSrc2ijQl1naw' // tu anon key completa

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
