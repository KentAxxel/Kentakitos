// js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Vercel leerá las variables de entorno automáticamente en producción
const supabaseUrl = window.process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'https://wshzmcxfcvsouiwbbsdp.supabase.co';
const supabaseAnonKey = window.process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7Dryj930GeOtEICslPSvGw_Ww7_wgG3';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);