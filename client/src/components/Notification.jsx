import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new SockJS('http://localhost:8080/chat-websocket');

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
    });

    client.onConnect = () => {
      console.log('Connected to notifications WebSocket');

      // Subscribe to the notifications topic
      client.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        setNotifications((prev) => [notification, ...prev]);
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
    };

    client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
    };

    client.activate();
    setStompClient(client);

    // Cleanup on component unmount
    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-500 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-2 font-bold">Notifications</div>
      <ul className="max-h-64 overflow-y-auto">
        {notifications.map((notification, index) => (
          <li key={index} className="px-4 py-2 border-b border-gray-200">
            {notification.type === 'COMMENT' && (
              <p><strong>{notification.user}</strong> commented on your post: "{notification.text}"</p>
            )}
            {notification.type === 'LIKE' && (
              <p><strong>{notification.user}</strong> liked your post.</p>
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