"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID,
// };

// ✅ Initialize Firebase once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const authentication = getAuth(app);

const FirebaseData = () => {
  const messagingInstance = async () => {
    try {
      const supported = await isSupported();
      if (!supported) return null;
      return getMessaging(app);
    } catch (err) {
      console.error("Messaging support error:", err);
      return null;
    }
  };

  const fetchToken = async (setFcmToken) => {
    try {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

      const messaging = await messagingInstance();
      if (!messaging) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const token = await getToken(messaging, {
        vapidKey: process.env.FIREBASE_VAPID_KEY,
      });

      if (token) setFcmToken(token);
    } catch (err) {
      console.error("FCM token error:", err);
    }
  };

  const onMessageListener = async () => {
    const messaging = await messagingInstance();
    if (!messaging) return null;

    return new Promise((resolve) => {
      onMessage(messaging, (payload) => resolve(payload));
    });
  };

  const signOut = () => authentication.signOut();

  return { authentication, fetchToken, onMessageListener, signOut };
};

export default FirebaseData;
