import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

// Profile component to display user details fetched from the database
const Profile = () => {
  const { user, logout } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/users/${user.id}`, {
            withCredentials: true,
          });
          setDbUser(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching user:", err);
          setError("Failed to load profile data. Please try again.");
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md w-full">
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md max-w-md w-full">
          <p className="font-semibold">Please login to view this page</p>
          <Link to="/login" className="mt-2 inline-block text-indigo-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Hero Section with Activity Summary */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-purple-600 text-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative flex flex-col md:flex-row items-center p-8 md:p-12">
            <div className="relative">
              {dbUser.picture ? (
                <img
                  src={dbUser.picture}
                  alt="Profile"
                  className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white shadow-lg transform transition hover:scale-105"
                  onError={(e) => (e.target.src = '/placeholder-image.jpg')}
                />
              ) : (
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-bold">
                  {dbUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex-1">
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{dbUser.name}</h1>
                <p className="mt-2 text-indigo-100 text-lg">{dbUser.email}</p>
                {dbUser.about && (
                  <p className="mt-3 text-indigo-200 text-base max-w-md">{dbUser.about}</p>
                )}
                <div className="mt-4">
                  <span className="inline-block bg-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
                    {dbUser.provider
                      ? dbUser.provider.charAt(0).toUpperCase() + dbUser.provider.slice(1)
                      : "Cook App"}
                  </span>
                </div>
              </div>
              {/* Activity Summary */}
              <div className="mt-6">
                <h2 className="text-xl font-bold text-white mb-4">Activity Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-800 bg-opacity-50 rounded-lg text-center transform transition hover:scale-105">
                    <p className="text-sm text-indigo-200">Posts</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <div className="p-4 bg-indigo-800 bg-opacity-50 rounded-lg text-center transform transition hover:scale-105">
                    <p className="text-sm text-indigo-200">Followers</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <div className="p-4 bg-indigo-800 bg-opacity-50 rounded-lg text-center transform transition hover:scale-105">
                    <p className="text-sm text-indigo-200">Following</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">Personal Information</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-center">
                  <span className="w-1/3 text-sm text-gray-500 font-medium">Full Name</span>
                  <span className="text-gray-900 font-medium">{dbUser.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/3 text-sm text-gray-500 font-medium">Email</span>
                  <span className="text-gray-900 font-medium">{dbUser.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/3 text-sm text-gray-500 font-medium">Birthday</span>
                  <span className="text-gray-900 font-medium">
                    {dbUser.birthday
                      ? new Date(dbUser.birthday).toLocaleDateString()
                      : "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">Account Information</h2>
              <div className="mt-6 space-y-6">
                <div className="flex items-center">
                  <span className="w-1/3 text-sm text-gray-500 font-medium">Sign-in Method</span>
                  <span className="text-gray-900 font-medium">
                    {dbUser.provider
                      ? `${dbUser.provider.charAt(0).toUpperCase() + dbUser.provider.slice(1)} OAuth`
                      : "Email/Password"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/3 text-sm text-gray-500 font-medium">Account ID</span>
                  <span className="text-gray-900 font-mono text-sm">{dbUser.id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/3 text-sm text-gray-500 font-medium">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions</h2>
            <div className="space-y-4">
            
            <Link
                to={`/followers`}
                className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
              >
                Follwers
              </Link>

            <Link
                to={`/following`}
                className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
              >
                Following
              </Link>

              <Link
                to={`/editprofile/${user.id}`}
                className="block w-full text-center bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-center bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;