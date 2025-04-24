import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AllUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followError, setFollowError] = useState(null);

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/users', {
          withCredentials: true,
        });
        // Map users to include isFollowed based on currentUser's following list
        const updatedUsers = response.data.map(user => ({
          ...user,
          isFollowed: currentUser?.following?.includes(user.id) || false,
        }));
        setUsers(updatedUsers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Handle follow button click
  const handleFollow = async (userId) => {
    setFollowError(null);
    try {
      // Send POST request to follow endpoint
      const response = await axios.post(`http://localhost:8080/users/${userId}/follow`, null, {
        withCredentials: true,
      });
      // Update local state to reflect follow status based on server response
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isFollowed: response.data.following.includes(userId) } : user
      ));
    } catch (err) {
      console.error('Failed to follow user:', err);
      const errorMessage = err.response?.data?.startsWith('Error: ')
        ? err.response.data
        : 'Could not follow user: Unknown error';
      setFollowError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-lg font-medium">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">All Users</h1>
        {followError && (
          <div className="mb-4 text-center text-red-500 text-sm">{followError}</div>
        )}
        {users.length === 0 || users.every((u) => u.id === currentUser?.id) ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users
              .filter((dbUser) => dbUser.id !== currentUser?.id)
              .map((dbUser) => (
                <div
                  key={dbUser.id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    {dbUser.picture ? (
                      <img
                        src={dbUser.picture}
                        alt={`${dbUser.name}'s profile`}
                        className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200 transform transition hover:scale-105"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-bold">
                        {dbUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/profile/${dbUser.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-indigo-600 truncate block"
                    >
                      {dbUser.name}
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={() => handleFollow(dbUser.id)}
                      disabled={dbUser.isFollowed}
                      aria-label={dbUser.isFollowed ? `Following ${dbUser.name}` : `Follow ${dbUser.name}`}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition transform hover:scale-105 disabled:cursor-not-allowed ${
                        dbUser.isFollowed
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {dbUser.isFollowed ? 'Following' : 'Add Follow'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}