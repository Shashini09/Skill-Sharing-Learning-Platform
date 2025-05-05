import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      const fetchUserAndActivity = async () => {
        try {
          // Fetch user data
          console.log('Fetching user data for ID:', user.id);
          const userResponse = await axios.get(`http://localhost:8080/users/${user.id}`, {
            withCredentials: true,
          });
          console.log('User data fetched:', userResponse.data);
          setDbUser(userResponse.data);

          // Fetch posts
          console.log('Fetching posts from /api/posts/all');
          const postsResponse = await axios.get('http://localhost:8080/api/posts/all', {
            withCredentials: true,
          });
          console.log('Posts fetched:', postsResponse.data);
          const userPosts = postsResponse.data
            .filter(post => post.userId === user.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          console.log('Filtered and sorted user posts:', userPosts);
          setPosts(userPosts);

          // Fetch followers
          try {
            const followersResponse = await axios.get(`http://localhost:8080/users/${user.id}/followers`, {
              withCredentials: true,
            });
            console.log('Followers fetched:', followersResponse.data);
            setFollowers(followersResponse.data || []);
          } catch (followersErr) {
            console.error('Error fetching followers:', followersErr);
            setFollowers([]);
          }

          // Fetch following using the correct endpoint for the current user
          try {
            const followingResponse = await axios.get(`http://localhost:8080/users/me/following`, {
              withCredentials: true,
            });
            console.log('Following fetched:', followingResponse.data);
            setFollowing(followingResponse.data || []);
          } catch (followingErr) {
            console.error('Error fetching following:', followingErr);
            setFollowing([]);
          }

          setLoading(false);
        } catch (err) {
          console.error('Error fetching data:', err.response || err.message);
          setError("Failed to load profile or posts. Please check your connection or login status.");
          setLoading(false);
        }
      };
      fetchUserAndActivity();
    } else {
      console.log('No user or user.id found, setting loading to false');
      setError('Please log in to view your profile.');
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log('Logging out user');
      await logout();
      navigate("/login");
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    }
  };

  const handleMessage = (userId, userName) => {
    console.log(`Message button clicked for user ID: ${userId}`);
    navigate(`/chat/${userId}`, { state: { name: userName } });
  };

  const renderActivityContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-3">You haven't posted anything yet.</p>
                <Link 
                  to="/createpost" 
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Your First Post
                </Link>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
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
                          onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Posted on {new Date(post.timestamp).toLocaleDateString()}</span>
                    {post.location && (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {post.location}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'followers':
        return (
          <div className="py-2">
            {followers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <p className="text-gray-500 text-center font-medium mb-2">No followers yet</p>
                <p className="text-gray-400 text-center text-sm max-w-xs">
                  Your followers will appear here once people start following your profile.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {followers.map(follower => (
                  <li key={follower.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={follower.picture || 'https://via.placeholder.com/40'}
                            alt={`${follower.name}'s avatar`}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                          />
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-medium">{follower.name}</h3>
                          <p className="text-gray-500 text-sm">Follower</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMessage(follower.id, follower.name)}
                          className="text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-md border border-indigo-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 transition duration-150 text-sm"
                        >
                          Message
                        </button>
                        <Link
                          to={`/frendsprofile/${follower.id}`}
                          className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition duration-150 text-sm"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'following':
        return (
          <div className="py-2">
            {following.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <p className="text-gray-500 text-center font-medium mb-2">You're not following anyone yet</p>
                <p className="text-gray-400 text-center text-sm max-w-xs">
                  When you follow someone, they'll appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {following.map(person => (
                  <li key={person.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={person.picture || 'https://via.placeholder.com/40'}
                            alt={`${person.name}'s profile`}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                          />
                        </div>
                        <div>
                          <h3 className="text-gray-800 font-medium">{person.name}</h3>
                          <p className="text-gray-500 text-sm">Following</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMessage(person.id, person.name)}
                          className="text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-md border border-indigo-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 transition duration-150 text-sm"
                        >
                          Message
                        </button>
                        <Link
                          to={`/frendsprofile/${person.id}`}
                          className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition duration-150 text-sm"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-500 font-medium">{error}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">Go back home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <p className="text-lg text-gray-700 mb-4">Please login to view this page</p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Profile picture section */}
            <div className="flex justify-center md:justify-start">
              {dbUser.picture ? (
                <img
                  src={dbUser.picture}
                  alt="Profile"
                  className="h-40 w-40 rounded-full object-cover border-4 border-blue-100 shadow-sm"
                  onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-sm">
                  {dbUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Profile details section */}
            <div className="col-span-2">
              <h1 className="text-2xl font-bold text-gray-900">{dbUser.name}</h1>
              <p className="text-gray-600 text-sm mt-1">{dbUser.email}</p>
              <p className="text-gray-600 text-sm mt-1">
                Birthday: {dbUser.birthday
                  ? new Date(dbUser.birthday).toLocaleDateString()
                  : "Not provided"}
              </p>
              {dbUser.about && (
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">{dbUser.about}</p>
              )}
              <div className="mt-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {dbUser.provider
                    ? dbUser.provider.charAt(0).toUpperCase() + dbUser.provider.slice(1)
                    : "Cook App"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-base font-medium text-gray-800 mb-3">Activity Snapshot</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow hover:border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Posts</p>
                    <div className="flex items-end">
                      <p className="text-lg font-bold text-gray-800">{posts.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow hover:border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Followers</p>
                    <div className="flex items-end">
                      <p className="text-lg font-bold text-gray-800">{followers.length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow hover:border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Following</p>
                    <div className="flex items-end">
                      <p className="text-lg font-bold text-gray-800">{following.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <Link 
                to="/chat" 
                className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Messages
              </Link>
              <Link 
                to="/createpost" 
                className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Post
              </Link>
              <Link 
                to={`/editprofile/${user.id}`} 
                className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 transition-colors ml-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts ({posts.length})
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === 'followers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('followers')}
            >
              Followers ({followers.length})
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === 'following'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('following')}
            >
              Following ({following.length})
            </button>
          </div>
          <div className="p-4">
            {renderActivityContent()}
          </div>
          {activeTab === 'posts' && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link 
                to="/createpost" 
                className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Post
              </Link>
            </div>
          )}
          {activeTab === 'followers' && followers.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link 
                to="/allusers" 
                className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Find More People
              </Link>
            </div>
          )}
          {activeTab === 'following' && following.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link 
                to="/allusers" 
                className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Find More People to Follow
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;