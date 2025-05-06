import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Notification from "./Notification"; // Import the Notification component

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Notification count state

  // Check if the current route matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle logout action
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

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Show loading state with skeleton placeholders
  if (loading) {
    return (
      <div className="bg-indigo-900 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="animate-pulse h-6 w-24 bg-indigo-700 rounded"></div>
          <div className="animate-pulse h-8 w-24 bg-indigo-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white py-3 px-6 shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white flex items-center">
              <span className="text-2xl mr-2">🍲</span>
              <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                CookBook
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && (
              <>
                <NavLink to="/profile" isActive={isActive("/profile")}>
                  Profile
                </NavLink>
                <NavLink to="/allusers" isActive={isActive("/allusers")}>
                  Friends
                </NavLink>
                <NavLink to="/postfeed" isActive={isActive("/postfeed")}>
                  Feed
                </NavLink>
                <NavLink to="/createpost" isActive={isActive("/createpost")}>
                  Create
                </NavLink>
                <NavLink to="/chat" isActive={isActive("/chat")}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 inline-block mr-1"
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
                  className="relative text-white focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80">
                    <Notification />
                  </div>
                )}
              </div>
            )}

            {/* User Info and Logout Button */}
            {user ? (
              <div className="flex items-center pl-3 ml-3 border-l border-indigo-700">
                <div className="flex items-center mr-3">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-indigo-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name && user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-indigo-100">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-all ${
                    isLoggingOut
                      ? "bg-indigo-700 cursor-not-allowed"
                      : "bg-indigo-700 hover:bg-indigo-600"
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
                    <span>Sign Out</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="bg-transparent hover:bg-indigo-800 text-indigo-100 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-sm transition-colors"
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
              className="text-white focus:outline-none"
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
          <div className="md:hidden mt-3 pt-3 border-t border-indigo-800">
            {user ? (
              <>
                <div className="flex items-center mb-4 pb-3 border-b border-indigo-800">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-indigo-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name && user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-indigo-100">{user.name}</span>
                </div>
                <div className="flex flex-col space-y-2">
                  <MobileNavLink to="/profile" isActive={isActive("/profile")} onClick={toggleMobileMenu}>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink to="/allusers" isActive={isActive("/allusers")} onClick={toggleMobileMenu}>
                    Friends
                  </MobileNavLink>
                  <MobileNavLink to="/postfeed" isActive={isActive("/postfeed")} onClick={toggleMobileMenu}>
                    Feed
                  </MobileNavLink>
                  <MobileNavLink to="/createpost" isActive={isActive("/createpost")} onClick={toggleMobileMenu}>
                    Create Post
                  </MobileNavLink>
                  <MobileNavLink to="/chat" isActive={isActive("/chat")} onClick={toggleMobileMenu}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 inline-block mr-1"
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
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`flex items-center justify-center py-2 px-4 rounded-md text-sm transition-all ${
                      isLoggingOut
                        ? "bg-indigo-700 cursor-not-allowed"
                        : "bg-indigo-700 hover:bg-indigo-600"
                    }`}
                  >
                    {isLoggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="block py-2 px-4 text-center rounded-md bg-transparent hover:bg-indigo-800 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 px-4 text-center rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors"
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
        <div className="container mx-auto mt-2 text-red-300 text-sm px-4">
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
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
        isActive
          ? "bg-indigo-800 text-white"
          : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
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
      className={`block py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center ${
        isActive
          ? "bg-indigo-800 text-white"
          : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;