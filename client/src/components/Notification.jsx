import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const Notification = ({ incrementNotificationCount }) => {
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/chat-websocket");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log("STOMP:", str),
    });

    client.onConnect = () => {
      console.log("✅ Connected to WebSocket");

      client.subscribe("/topic/notifications", (message) => {
        try {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => {
            const updatedNotifications = [notification, ...prev];
            localStorage.setItem(
              "notifications",
              JSON.stringify(updatedNotifications)
            );
            return updatedNotifications;
          });
          setUnreadCount((prev) => prev + 1);
          incrementNotificationCount();
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
    };

    client.onWebSocketError = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🔌 Disconnecting WebSocket");
      client.deactivate();
    };
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-4 right-4 w-1/2 h-1/2 bg-white bg-opacity-50 shadow-2xl rounded-lg overflow-hidden z-50 border border-gray-300">
      <div className="bg-blue-700 bg-opacity-90 text-white px-6 py-3 font-bold flex justify-between items-center">
        <span className="text-lg">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm bg-white text-blue-700 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-100 transition"
          >
            Mark all as read
          </button>
        )}
      </div>
      <ul className="h-full overflow-y-auto divide-y divide-gray-200">
        {notifications.map((notification, index) => (
          <li key={index} className="px-6 py-4 hover:bg-gray-50 transition">
            {notification.type === "COMMENT" && (
              <p className="text-gray-800">
                <strong className="text-blue-700">{notification.user}</strong>{" "}
                commented: "{notification.text}"
              </p>
            )}
            {notification.type === "LIKE" && (
              <p className="text-gray-800">
                <strong className="text-blue-700">{notification.user}</strong>{" "}
                liked your post.
              </p>
            )}
          </li>
        ))}
        {notifications.length === 0 && (
          <li className="px-6 py-4 text-gray-500 text-center">
            No notifications yet.
          </li>
        )}
      </ul>
    </div>
  );
};

export default Notification;
