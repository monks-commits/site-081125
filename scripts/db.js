// scripts/db.js  ← это ESM-модуль, без <script>...</script>
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://hkeuabtiemsxadusmqlo.supabase.co', // Settings → API → Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrZXVhYnRpZW1zeGFkdXNtcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDE3MzcsImV4cCI6MjA3NjE3NzczN30.aOHorW8nvctPxC1If_HNTl6iq_7cDHzFgFEPJg3PPPE'                  // Settings → API → Project API keys → anon public
);
