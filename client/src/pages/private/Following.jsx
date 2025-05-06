import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Functional component to display the list of users the current user is following
export default function Following() {
  // State to store the list of followed users
  const [following, setFollowing] = useState([]);
  // State to handle loading status
  const [loading, setLoading] = useState(true);
  // State to handle errors
  const [error, setError] = useState(null);

  // useEffect to fetch the list of followed users when the component mounts
  useEffect(() => {
    // Async function to fetch data from the backend
    const fetchFollowing = async () => {
      try {
        // Set loading to true while fetching
        setLoading(true);
        // Make a GET request to the /users/following endpoint
        const response = await axios.get('http://localhost:3001/users/me/following', {
          // Include credentials for session-based authentication
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // Set the fetched users to state
        setFollowing(response.data);
        setLoading(false);
      } catch (err) {
        // Handle specific HTTP errors
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

    // Call the fetch function
    fetchFollowing();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Following</h2>

        {/* Loading state */}
        {loading && (
          <div className="text-center text-gray-600">
            <svg
              className="animate-spin h-8 w-8 mx-auto text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              ></path>
            </svg>
            <p className="mt-2">Loading...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {/* Following list */}
        {!loading && !error && (
          <div className="bg-white shadow-sm rounded-lg">
            {following.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {following.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-4 hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    {/* Profile picture */}
                    <img
                      src={user.picture || 'https://via.placeholder.com/40'}
                      alt={`${user.name}'s profile`}
                      className="h-10 w-10 rounded-full object-cover mr-4"
                    />
                    {/* User name */}
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-gray-500 text-center">
                You are not following anyone yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}