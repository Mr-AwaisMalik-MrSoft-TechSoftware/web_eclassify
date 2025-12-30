"use client";
import { useEffect, useState } from "react";
import "firebase/messaging";
import FirebaseData from "../../utils/Firebase";
import { useDispatch } from "react-redux";
import { setNotification } from "@/redux/reducer/globalStateSlice";
import { useNavigate } from "../Common/useNavigate";

const PushNotificationLayout = ({ children, onNotificationReceived }) => {
  const dispatch = useDispatch();
  const [fcmToken, setFcmToken] = useState("");
  const { fetchToken, onMessageListener } = FirebaseData();
  const { navigate } = useNavigate();
  const handleFetchToken = async () => {
    await fetchToken(setFcmToken);
  };

  useEffect(() => {
    handleFetchToken();
  }, []);

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        if (payload && payload.data) {
          dispatch(setNotification(payload.data));
          if (Notification.permission === "granted") {
            const notif = new Notification(payload.notification.title, {
              body: payload.notification.body,
            });
            const tab =
              payload.data?.user_type === "Seller" ? "buying" : "selling";

            notif.onclick = () => {
              if (
                payload.data.type === "chat" ||
                payload.data.type === "offer"
              ) {
                navigate(
                  `/chat?activeTab=${tab}&chatid=${payload.data?.item_offer_id}`
                );
              }
            };
          }
        }
      })
      .catch((err) => {
        console.error("Error handling foreground notification:", err);
      });
  }, [onNotificationReceived]);

  useEffect(() => {
    if (fcmToken) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope
            );
          })
          .catch((err) => {
            console.log("Service Worker registration failed: ", err);
          });
      }
    }
  }, [fcmToken]);

  return children;
};

export default PushNotificationLayout;
