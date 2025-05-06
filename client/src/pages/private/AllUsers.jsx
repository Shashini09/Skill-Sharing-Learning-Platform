import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function AllUsers({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followError, setFollowError] = useState(null);
  const [isProcessing, setIsProcessing] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/users', {
          withCredentials: true,
        });
        // Log the API response for debugging
        console.log('Fetched users:', response.data);
        console.log('Current user:', currentUser);

        // Ensure response.data is an array
        const fetchedUsers = Array.isArray(response.data) ? response.data : [];
        if (fetchedUsers.length === 0) {
          setError('No users found in the system.');
        }

        // Validate that each user has an id
        const validUsers = fetchedUsers.filter(user => user.id !== undefined && user.id !== null);
        if (validUsers.length < fetchedUsers.length) {
          console.warn('Some users were excluded due to missing or invalid IDs:', fetchedUsers);
        }

        const updatedUsers = validUsers.map(user => ({
          ...user,
          isFollowed: currentUser?.following?.includes(user.id) || false,
        }));
        setUsers(updatedUsers);
        setLoading(false);
      } catch (err) {
        console.error('Fetch users error:', err);
        setError('Failed to fetch users. Please check the server or try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleFollowToggle = async (userId, isFollowed) => {
    if (isProcessing[userId]) return;

    setFollowError(null);
    setIsProcessing(prev => ({ ...prev, [userId]: true }));

    const previousUsers = [...users];
    setUsers(users.map(user =>
      user.id === userId ? { ...user, isFollowed: !isFollowed } : user
    ));

    try {
      if (isFollowed) {
        await axios.post(`http://localhost:8080/users/${userId}/unfollow`, null, {
          withCredentials: true,
        });
      } else {
        await axios.post(`http://localhost:8080/users/${userId}/follow`, null, {
          withCredentials: true,
        });
      }
    } catch (err) {
      console.error(`${isFollowed ? 'Unfollow' : 'Follow'} failed:`, err);
      setUsers(previousUsers);
      const errorMessage = err.response?.data || `Could not ${isFollowed ? 'unfollow' : 'follow'} user: Unknown error`;
      setFollowError(errorMessage);
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredUsers = users
    .filter((dbUser) => {
      // Exclude current user if currentUser and currentUser.id are valid
      if (currentUser && currentUser.id !== undefined && currentUser.id !== null) {
        const isNotCurrentUser = String(dbUser.id) !== String(currentUser.id);
        console.log(`Comparing dbUser.id=${dbUser.id} (${typeof dbUser.id}) with currentUser.id=${currentUser.id} (${typeof currentUser.id}): ${isNotCurrentUser ? 'Excluding' : 'Including'}`);
        return isNotCurrentUser;
      }
      // Log warning if currentUser is invalid
      console.warn('No valid currentUser, including all users. Check currentUser prop:', currentUser);
      return true;
    })
    .filter((dbUser) => 
      dbUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dbUser.email && dbUser.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((dbUser) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'following') return dbUser.isFollowed;
      if (selectedFilter === 'not-following') return !dbUser.isFollowed;
      return true;
    });

  // Log filtered users for debugging
  console.log('Filtered users:', filteredUsers);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-indigo-100">
        <div className="p-10 rounded-2xl shadow-lg bg-white text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-6"></div>
          <p className="text-gray-700 text-lg font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-indigo-100">
        <div className="p-10 rounded-2xl shadow-lg bg-white text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-500 font-semibold text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm text-base font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-indigo-600 p-8">
            <h1 className="text-3xl font-bold text-white">Connect with People</h1>
            <p className="text-indigo-100 mt-2 text-lg">
              Discover and follow other users to see their content
            </p>
          </div>
          
          {followError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{followError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0 gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email"
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-lg text-base font-medium ${
                    selectedFilter === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('following')}
                  className={`px-4 py-2 rounded-lg text-base font-medium ${
                    selectedFilter === 'following' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                >
                  Following
                </button>
                <button
                  onClick={() => setSelectedFilter('not-following')}
                  className={`px-4 py-2 rounded-lg text-base font-medium ${
                    selectedFilter === 'not-following' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                >
                  Not Following
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-600 text-lg font-medium mb-4">No users found.</p>
            {searchTerm && (
              <p className="text-gray-500 text-base">Try adjusting your search or filter criteria.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((dbUser) => (
              <div
                key={dbUser.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {dbUser.picture ? (
                      <img
                        src={dbUser.picture}
                        alt={`${dbUser.name}'s profile`}
                        className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/100')}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                        {dbUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        to={`/profile/${dbUser.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                      >
                        {dbUser.name}
                      </Link>
                      {dbUser.email && (
                        <p className="text-sm text-gray-500 truncate">{dbUser.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/profile/${dbUser.id}`}
                      className="text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                    >
                      View Profile
                    </Link>
                    
                    <button
                      onClick={() => handleFollowToggle(dbUser.id, dbUser.isFollowed)}
                      disabled={isProcessing[dbUser.id]}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm ${
                        dbUser.isFollowed
                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600`}
                    >
                      {isProcessing[dbUser.id] ? (
                        <svg
                          className="animate-spin h-6 w-6 mr-2"
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
                      ) : (
                        <>
                          {dbUser.isFollowed ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Following
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                              Follow
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}