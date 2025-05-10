import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const FriendsProfile = () => {
  const { id } = useParams();
  const friendId = id;

  // State management
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); // Implement actual state later

  const fallbackImage = "/images/fallback.jpg";

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(
          `http://localhost:8080/users/${friendId}`,
          {
            withCredentials: true,
          }
        );
        setUser(userResponse.data);

        // Fetch and filter posts
        const postsResponse = await axios.get(
          `http://localhost:8080/api/posts/all`,
          {
            withCredentials: true,
          }
        );
        setPosts(postsResponse.data.filter((post) => post.userId === friendId));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load profile data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [friendId]);

  // Handle image load errors
  const handleImageError = (e) => {
    e.target.src = fallbackImage;
  };

  // Toggle follow status (to be implemented)
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    // API call would go here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-6">
            {/* Profile Header - Instagram Style */}
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Profile Picture */}
              <div className="flex justify-center">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={`${user.name}'s profile`}
                    className="h-32 w-32 rounded-full object-cover border border-gray-200"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Profile Info - Instagram Style */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {user?.name}
                  </h1>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <button
                      onClick={toggleFollow}
                      className={`px-4 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                        isFollowing
                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <Link
                      to={`/chat`}
                      className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded text-sm font-medium hover:bg-gray-200 transition-all duration-200 flex items-center"
                    >
                      Message
                    </Link>
                  </div>
                </div>

                {/* Profile Stats - Instagram Style */}
                <div className="flex gap-8 mb-4">
                  <div className="text-center">
                    <span className="font-semibold text-gray-900">
                      {posts.length}
                    </span>
                    <span className="text-gray-600 block text-sm">Posts</span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-900">
                      {user?.followers?.length || 0}
                    </span>
                    <span className="text-gray-600 block text-sm">
                      Followers
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-gray-900">
                      {user?.following?.length || 0}
                    </span>
                    <span className="text-gray-600 block text-sm">
                      Following
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{user?.email}</p>

                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {user?.birthday
                        ? new Date(user.birthday).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Birthday not provided"}
                    </span>
                  </div>

                  <div className="inline-block px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-700">
                    {user?.provider}
                  </div>

                  {user?.about && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {user.about}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Navigation Tabs - Instagram Style */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-3 text-center font-medium text-sm border-b-2 border-black text-black">
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                POSTS
              </div>
            </button>
            <button className="flex-1 py-3 text-center font-medium text-sm text-gray-500 hover:text-gray-700">
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                SAVED
              </div>
            </button>
            <button className="flex-1 py-3 text-center font-medium text-sm text-gray-500 hover:text-gray-700">
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                TAGGED
              </div>
            </button>
          </div>

          {/* Posts Scroll View */}
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No Posts Yet
              </h3>
              <p className="text-gray-500 text-sm">
                When {user?.name} shares shares posts, you'll see them here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 p-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="flex items-center p-4">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={`${user.name}'s profile`}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      {post.location && (
                        <p className="text-xs text-gray-500">{post.location}</p>
                      )}
                    </div>
                  </div>
                  {/* Post Content */}
                  {post.mediaUrls &&
                  Array.isArray(post.mediaUrls) &&
                  post.mediaUrls.length > 0 ? (
                    <img
                      src={post.mediaUrls[0]}
                      alt={post.topic}
                      className="w-full h-96 object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-96 bg-gray-100 flex items-center justify-center p-4">
                      <p className="text-sm text-gray-600 text-center">
                        {post.description}
                      </p>
                    </div>
                  )}
                  {/* Post Footer */}
                  <div className="p-4">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">0</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span className="ml-1 text-sm text-gray-600">0</span>
                      </div>
                    </div>
                    {post.description && (
                      <p className="text-sm text-gray-900">
                        {post.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsProfile;
