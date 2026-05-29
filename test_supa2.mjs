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
  const { data: d1, error: e1 } = await supabase.from('visits').insert([{ visitor_id: 'test' }]);
  console.log("VISITS INSERT:", d1, e1);
  
  const { data: d2, error: e2 } = await supabase.from('push_subscriptions').upsert([{ endpoint: 'test_token', keys: { auth:'', p256dh:''} }], { onConflict: 'endpoint' });
  console.log("PUSH UPSERT:", d2, e2);
}

test();
