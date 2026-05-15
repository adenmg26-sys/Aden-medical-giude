importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 1. You MUST put your exact Firebase Config here since service workers cannot access process.env
const firebaseConfig = {
  apiKey: "AIzaSyDflNjAQNTzgQyBAPStVFztaldsCC7Fgxc",
  authDomain: "aden-medical-guide.firebaseapp.com",
  projectId: "aden-medical-guide",
  storageBucket: "aden-medical-guide.firebasestorage.app",
  messagingSenderId: "1048156108009",
  appId: "1:1048156108009:web:21eaa32dd3488cfde52c78"
};

// 2. Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp(firebaseConfig);

// 3. Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'إشعار جديد من مرشد عدن الطبي';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك تحديث جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    dir: 'rtl',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
