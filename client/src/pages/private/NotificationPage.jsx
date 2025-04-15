import React, { useEffect, useState } from 'react';
import { FaThumbsUp, FaCommentDots } from 'react-icons/fa';
import PostActions from '../../components/Post-Management/PostActions';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  // Sample notifications (you can remove this when you connect backend)
  useEffect(() => {
    const sampleData = [
      {
        id: 1,
        type: 'like',
        message: 'John liked your post on "How to make Pasta".',
        timestamp: '2025-04-12T14:35:00Z',
        read: false
      },
      {
        id: 2,
        type: 'comment',
        message: 'Anna commented: "This helped me so much, thanks!"',
        timestamp: '2025-04-11T10:15:00Z',
        read: true
      },
      {
        id: 3,
        type: 'like',
        message: 'Michael liked your post "JavaScript Basics".',
        timestamp: '2025-04-10T18:45:00Z',
        read: false
      }
    ];
    setNotifications(sampleData);
  }, []);

  const renderIcon = (type) => {
    if (type === 'like') return <FaThumbsUp className="text-blue-500 mr-3" size={20} />;
    if (type === 'comment') return <FaCommentDots className="text-green-500 mr-3" size={20} />;
    return null;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">🔔 Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start p-4 border rounded-lg shadow-sm hover:shadow-md transition-all ${
                n.read ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              {renderIcon(n.type)}
              <div>
                <p className="text-gray-800 text-sm">{n.message}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(n.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <PostActions></PostActions>
      </div>
      <div>
        <h1>
            Notifications
        </h1>
      </div>
    </div>
    
  );
}

export default NotificationsPage;
