// js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Vercel leerá las variables de entorno automáticamente en producción
const supabaseUrl = window.process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = window.process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-clave-anon';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);