import { createClient } from '@supabase/supabase-js'

let client = null

export const useSupabaseClient = () => {
  if (client) return client
  const config = useRuntimeConfig()
  client = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
    { auth: { persistSession: true, autoRefreshToken: true } }
  )
  return client
}
