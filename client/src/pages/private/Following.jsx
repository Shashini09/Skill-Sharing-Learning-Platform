import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Following() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/users/me/following', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setFollowing(response.data || []);
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
      console.error('Error fetching following:', err);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <p className="text-red-500 text-lg font-medium text-center">{error}</p>
          <button 
            onClick={fetchFollowing}
            className="mt-4 w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-200 ease-in-out"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-800">People You Follow</h2>
            </div>
            <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm font-medium">
              {following.length} {following.length === 1 ? 'person' : 'people'}
            </span>
          </div>
          
          <div className="p-1">
            {following.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <p className="text-gray-500 text-center font-medium mb-2">You're not following anyone yet</p>
                <p className="text-gray-400 text-center text-sm max-w-xs">
                  When you follow someone, they'll appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {following.map((user) => (
                  <li
                    key={user.id}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={user.picture || 'https://via.placeholder.com/40'}
                            alt={`${user.name}'s profile`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-medium">{user.name}</h3>
                          <p className="text-gray-500 text-sm">Following</p>
                        </div>
                      </div>
                      <div>
                        <Link
                          to={`/users/${user.id}`}
                          className="text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-md border border-indigo-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 transition duration-150 text-sm"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}