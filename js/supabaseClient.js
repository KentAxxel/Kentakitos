// js/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Coloca la URL de tu proyecto (esta está perfecta)
const supabaseUrl = 'https://wshzmcxfcvsouiwbbsdp.supabase.co'; 

// ⚠️ REEMPLAZA ESTA LÍNEA: Ve a Supabase -> Settings -> API -> Project API Keys.
// Copia la clave de la casilla "anon public" (Debe ser un texto larguísimo que empieza con eyJhbGci...)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaHptY3hmY3Zzb3Vpd2Jic2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTY2MjEsImV4cCI6MjA5NTQ3MjYyMX0.XcAJYi9vJmoOBKQmkWmNadmrhDBDUBmheWEZEGELs-c'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);