import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { supabase } from "./supabase";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging(app);
      const currentToken = await getToken(messaging, { 
        // VAPID KEY
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
      });

      if (currentToken) {
        // Save the token to your database so you can send messages to this device later
        if (supabase) {
           await supabase.from('push_subscriptions').insert([{
              endpoint: currentToken,
              keys: { auth: '', p256dh: '' } // Legacy format fields, just use endpoint for FCM
           }]);
        }
        return currentToken;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    isSupported().then((supported) => {
       if (supported) {
         const messaging = getMessaging(app);
         onMessage(messaging, (payload) => {
           resolve(payload);
         });
       }
    });
  });
};
