import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Notification from "./Notification";

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const incrementNotificationCount = () => {
    setNotificationCount((prev) => prev + 1);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showNotifications) {
      setNotificationCount(0);
    }
  };

  if (loading) {
    return (
      <div className="bg-purple-800 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-800 text-white py-3 px-6 shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <span className="text-2xl mr-2 text-purple-100">🍲</span>
              <span className="bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
                CookBook
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <>
                <NavLink to="/profile" isActive={isActive("/profile")}>
                  Profile
                </NavLink>
                <NavLink to="/allusers" isActive={isActive("/allusers")}>
                  Friends
                </NavLink>
                <NavLink to="/postfeed" isActive={isActive("/postfeed")}>
                  Post Feed
                </NavLink>
                <NavLink
                  to="/learning-plans"
                  isActive={isActive("/learning-plans")}
                >
                  Learning Plans
                </NavLink>
                <NavLink
                  to="/progress-feed"
                  isActive={isActive("/progress-feed")}
                >
                  Progress Feed
                </NavLink>
                <NavLink to="/chat" isActive={isActive("/chat")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline-block mr-1"
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
                  Chat
                </NavLink>
              </>
            )}

            {/* Notification Icon */}
            {user && (
              <div className="relative flex items-center">
                <button
                  onClick={toggleNotifications}
                  className="relative text-white focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full p-1 transition-all duration-200 hover:bg-purple-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                    />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-lg z-50">
                    <Notification
                      incrementNotificationCount={incrementNotificationCount}
                    />
                  </div>
                )}
              </div>
            )}

            {/* User Info and Logout Button */}
            {user ? (
              <div className="flex items-center pl-3 ml-2 border-l border-purple-600">
                <div className="flex items-center mr-3">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-purple-300 flex items-center justify-center border border-purple-200 shadow-sm">
                      <span className="text-sm font-medium text-purple-900">
                        {user.name && user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-white">
                    {user.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm ${
                    isLoggingOut
                      ? "bg-purple-600 cursor-not-allowed text-purple-200"
                      : "bg-purple-700 hover:bg-purple-600 text-white hover:shadow-md"
                  }`}
                >
                  {isLoggingOut ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                    <span>Sign Out</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="bg-transparent hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm border border-purple-600"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-1 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-md p-2 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-purple-600 rounded-b-lg shadow-inner bg-purple-900">
            {user ? (
              <>
                <div className="flex items-center mb-4 pb-3 border-b border-purple-600 px-2">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-purple-300 shadow-sm"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-300 flex items-center justify-center border border-purple-200 shadow-sm">
                      <span className="text-md font-medium text-purple-900">
                        {user.name && user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="ml-3 text-sm font-medium text-white">
                    {user.name}
                  </span>
                  
                  {/* Mobile Notification Icon */}
                  <div className="ml-auto mr-2 relative">
                    <button
                      onClick={toggleNotifications}
                      className="relative text-white focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full p-1 hover:bg-purple-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
                        />
                      </svg>
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 px-2 pb-3">
                  <MobileNavLink
                    to="/profile"
                    isActive={isActive("/profile")}
                    onClick={toggleMobileMenu}
                  >
                    Profile
                  </MobileNavLink>
                  <MobileNavLink
                    to="/allusers"
                    isActive={isActive("/allusers")}
                    onClick={toggleMobileMenu}
                  >
                    Friends
                  </MobileNavLink>
                  <MobileNavLink
                    to="/postfeed"
                    isActive={isActive("/postfeed")}
                    onClick={toggleMobileMenu}
                  >
                    Post Feed
                  </MobileNavLink>
                  <MobileNavLink
                    to="/learning-plans"
                    isActive={isActive("/learning-plans")}
                    onClick={toggleMobileMenu}
                  >
                    Learning Plans
                  </MobileNavLink>
                  <MobileNavLink
                    to="/progress-feed"
                    isActive={isActive("/progress-feed")}
                    onClick={toggleMobileMenu}
                  >
                    Progress Feed
                  </MobileNavLink>
                  <MobileNavLink
                    to="/chat"
                    isActive={isActive("/chat")}
                    onClick={toggleMobileMenu}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 inline-block mr-1"
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
                    Chat
                  </MobileNavLink>
                  
                  <div className="pt-2 mt-2 border-t border-purple-600">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm ${
                        isLoggingOut
                          ? "bg-purple-600 cursor-not-allowed text-purple-200"
                          : "bg-purple-700 hover:bg-purple-600 text-white"
                      }`}
                    >
                      {isLoggingOut ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
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
                          Signing Out...
                        </>
                      ) : (
                        "Sign Out"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 p-2">
                <Link
                  to="/login"
                  className="block py-2 px-4 text-center rounded-md bg-transparent hover:bg-purple-700 text-white transition-colors duration-200 shadow-sm border border-purple-600"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 px-4 text-center rounded-md bg-purple-700 hover:bg-purple-600 text-white transition-colors duration-200 shadow-sm"
                  onClick={toggleMobileMenu}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {logoutError && (
        <div className="container mx-auto mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">
          {logoutError}
        </div>
      )}
    </div>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ to, isActive, children }) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
        isActive
          ? "bg-purple-900 text-white shadow-inner"
          : "text-white hover:bg-purple-700 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
};

// Mobile Navigation Link Component
const MobileNavLink = ({ to, isActive, onClick, children }) => {
  return (
    <Link
      to={to}
      className={`block py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "bg-purple-900 text-white shadow-inner"
          : "text-white hover:bg-purple-700 hover:text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;