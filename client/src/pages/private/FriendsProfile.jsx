import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const FriendsProfile = () => {
  // Fetch the user ID from the URL
  const { id } = useParams();
  const friendId = id;

  // State for user data, loading, and error
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock posts data (replace with API call if needed)
  const posts = [
    {
      id: '1',
      topic: 'Delicious Pasta Recipe',
      description: 'Quick and easy pasta dish for weeknight dinners.',
      mediaUrls: ['https://via.placeholder.com/80'],
      timestamp: '2025-05-01T10:00:00Z',
      location: 'New York',
    },
    {
      id: '2',
      topic: 'Homemade Pizza Night',
      description: 'Fun pizza recipe for the whole family!',
      mediaUrls: ['https://via.placeholder.com/80'],
      timestamp: '2025-04-28T18:00:00Z',
      location: 'Chicago',
    },
  ];

  const isFollowing = false; // Mock state for follow/unfollow

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data for ID:', friendId);
        const userResponse = await axios.get(`http://localhost:8080/users/${friendId}`, {
          withCredentials: true,
        });
        setUser(userResponse.data); // Set the fetched user data
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user details. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [friendId]); // Re-run if friendId changes

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Render the profile if user data is available
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex justify-center">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex gap-3">
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  <Link
                    to={`/chat`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Message
                  </Link>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
              <p className="text-gray-600 text-sm mt-1">
                Birthday: {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not provided'}
              </p>
              {user.about && (
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">{user.about}</p>
              )}
              <div className="mt-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  {user.provider}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts</h2>
            {posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">No posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-base font-semibold text-gray-800">{post.topic}</h3>
                    <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mt-2 flex space-x-2 overflow-x-auto py-1">
                        {post.mediaUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post media ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Posted on {new Date(post.timestamp).toLocaleDateString()}</span>
                      {post.location && (
                        <span className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {post.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsProfile;