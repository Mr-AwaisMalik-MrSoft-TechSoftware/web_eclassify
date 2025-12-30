importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCdvj8g8waul6Fok6YnXI4zAPwTh3UrjaQ",
  authDomain: "ca-wheels.firebaseapp.com",
  projectId: "ca-wheels",
  storageBucket: "ca-wheels.firebasestorage.app",
  messagingSenderId: "420653888644",
  appId: "1:420653888644:web:ccf5ba127482b931133ed1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/favicon.ico",
    }
  );
});
