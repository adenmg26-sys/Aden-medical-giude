import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
    .map(([key, ...val]) => [key, val.join('=')])
);

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('visits').select('*').limit(1);
  console.log("VISITS:", data, error);
  
  const { data: d2, error: e2 } = await supabase.from('push_subscriptions').select('*').limit(1);
  console.log("PUSH:", d2, e2);
}

test();
