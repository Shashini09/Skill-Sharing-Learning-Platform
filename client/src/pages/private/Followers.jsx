import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Followers component to display the list of followers' names in a Facebook-like UI
export default function Followers() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/users/me/followers', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setFollowers(response.data || []); // Ensure followers is always an array
      setLoading(false);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Unauthorized: Please log in again.');
        } else if (err.response.status === 404) {
          setError('Endpoint not found. Please check the backend server.');
        } else {
          setError(`Error: ${err.response.statusText}`);
        }
      } else {
        setError('Network error: Could not connect to the server.');
      }
      setLoading(false);
      console.error('Error fetching followers:', err);
    }
  };

  useEffect(() => {
    fetchFollowers(); // Fetch followers on mount
  }, []); // Empty dependency array to prevent infinite loop

  // Handle message button click
  const handleMessage = (followerId, followerName) => {
    console.log(`Message button clicked for follower ID: ${followerId}`);
    navigate(`/chat/${followerId}`, { state: { name: followerName } });
  };

  // Handle view profile button click
  const handleViewProfile = (followerId, followerName) => {
    console.log(`View Profile button clicked for follower ID: ${followerId}`);
    navigate(`/frendsprofile/${followerId}`, { state: { name: followerName } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Followers</h2>
        </div>
        <div className="p-6">
          {followers.length === 0 ? (
            <p className="text-gray-500 text-center">No followers yet.</p>
          ) : (
            <ul className="space-y-4">
              {followers.map((follower) => (
                <li
                  key={follower.id}
                  className="flex items-center justify-between space-x-4 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={follower.picture || 'https://via.placeholder.com/40'}
                      alt={`${follower.name}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-gray-800 font-medium">{follower.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMessage(follower.id, follower.name)}
                      className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleViewProfile(follower.id, follower.name)}
                      className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}