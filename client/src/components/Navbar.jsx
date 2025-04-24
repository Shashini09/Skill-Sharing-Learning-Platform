import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      navigate("/login");
    } catch (error) {
      setLogoutError("Failed to logout. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogin = (provider) => {
    try {
      login(provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="animate-pulse h-6 w-24 bg-gray-600 rounded"></div>
          <div className="animate-pulse h-8 w-24 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
        {/* Left Side - Brand & Navigation */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-xl font-bold hover:text-blue-300 transition-colors"
          >
            CookBook
          </Link>

          {user && (
            <div className="flex space-x-4">

<Link
                to="/feed"
                className="hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700"
              >
                Fedds
              </Link>
              <Link
                to="/allusers"
                className="hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700"
              >
                Friends
              </Link>
              <Link
                to="/profile"
                className="hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-700"
              >
                Profile
              </Link>
            </div>
          )}
        </div>

        {/* Right Side - Auth Buttons & User Info */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <span className="text-sm">{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  isLoggingOut
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="me-5">
                Login
              </Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {logoutError && (
        <div className="container mx-auto mt-2 text-red-400 text-sm">
          {logoutError}
        </div>
      )}
    </div>
  );
};

export default Navbar;
