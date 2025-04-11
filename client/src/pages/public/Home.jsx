import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to SocialApp</h1>
      <p className="text-gray-600">
        Please sign in to access your social feed and profile.
      </p>
      <div className="mt-6">
        <Link
          to="/login"
          className="bg-blue-500 text-white py-3 px-4 shadow-lg rounded-md me-5"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-blue-500 text-white py-3 px-4 shadow-lg rounded-md"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
