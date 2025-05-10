import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Notification = ({ incrementNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef(null); // 🔐 Keeps client reference stable

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/chat-websocket');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP:', str),
    });

    client.onConnect = () => {
      console.log('✅ Connected to WebSocket');

      client.subscribe('/topic/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          incrementNotificationCount();
        } catch (err) {
          console.error('❌ Error parsing message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame.headers['message']);
    };

    client.onWebSocketError = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('🔌 Disconnecting WebSocket');
      client.deactivate(); // ✅ Disconnect safely on unmount
    };
  }, []); // ✅ Empty dependency ensures one-time setup

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      <div className="bg-blue-600 text-white px-4 py-2 font-bold flex justify-between items-center">
        <span>Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm bg-white text-blue-600 px-2 py-1 rounded"
          >
            Mark all as read
          </button>
        )}
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {notifications.map((notification, index) => (
          <li key={index} className="px-4 py-2 border-b border-gray-200">
            {notification.type === 'COMMENT' && (
              <p className="text-blue-600">
                <strong>{notification.user}</strong> commented: "{notification.text}"
              </p>
            )}
            {notification.type === 'LIKE' && (
              <p className="text-blue-600">
                <strong>{notification.user}</strong> liked your post.
              </p>
            )}
          </li>
        ))}
        {notifications.length === 0 && (
          <li className="px-4 py-2 text-gray-500">No notifications yet.</li>
        )}
      </ul>
    </div>
  );
};

export default Notification;
