import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktxfspeiqetfwbbxnysm.supabase.co'
const supabaseAnonKey = 'sb_publishable_Bz8g1G2bpAY_ms5obNARdw_Zy_E6kme'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

