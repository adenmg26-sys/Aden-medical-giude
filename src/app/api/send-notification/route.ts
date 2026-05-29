import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { supabase } from '@/lib/supabase';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error', error);
  }
}

export async function POST(req: Request) {
  try {
    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not connected" }, { status: 500 });
    }

    // Fetch all subscription tokens from Supabase
    const { data: subs, error } = await supabase.from('push_subscriptions').select('endpoint');
    
    if (error || !subs || subs.length === 0) {
      return NextResponse.json({ message: "No subscribers found", success: false });
    }

    const tokens = subs.map(sub => sub.endpoint);

    // Send using FCM Multicast
    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        fcmOptions: {
          link: "/",
        },
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          dir: "rtl" as const,
        }
      },
      tokens, // Max 500 tokens per multicast
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Cleanup invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        await supabase.from('push_subscriptions').delete().in('endpoint', failedTokens);
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: response.successCount, 
      failed: response.failureCount 
    });

  } catch (error: any) {
    console.error('Push Notification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
