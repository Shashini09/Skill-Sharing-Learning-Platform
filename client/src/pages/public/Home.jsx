import React from "react";
import { Link } from "react-router-dom";
import BannerImg from '../../assets/banner.jpg';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean and minimal */}
      <section className="container mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-900">
            Discover & Share 
            <span className="block mt-2">Culinary Creations</span>
          </h1>
          <p className="text-lg text-gray-600">
            Join our cooking community to create, share, and learn delicious recipes.
            Track your cooking journey with personalized learning plans.
          </p>
          <Link
            to="/login"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
        <div className="md:w-1/2">
          <img
            src={BannerImg}
            alt="Delicious meal"
            className="w-full h-auto rounded-xl shadow-lg object-cover"
          />
        </div>
      </section>

      {/* Features Section - Simplified with purple accents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-purple-900 mb-12">
            How to Use CookBook
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              title="Create & Share"
              description="Post your favorite recipes and share them with the community."
              icon={<PlusIcon />}
            />
            
            <FeatureCard 
              title="Learn & Track"
              description="Build learning plans and track your cooking progress."
              icon={<CheckIcon />}
            />
            
            <FeatureCard 
              title="Engage"
              description="Like, comment, and connect with other food enthusiasts."
              icon={<ShareIcon />}
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-purple-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-purple-900 mb-4">
            Ready to Start Your Culinary Journey?
          </h2>
          <p className="text-lg text-purple-700 mb-8 max-w-2xl mx-auto">
            Join thousands of food enthusiasts who are creating and sharing amazing recipes every day.
          </p>
          <Link
            to="/login"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

// Feature card component for cleaner code organization
const FeatureCard = ({ title, description, icon }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-purple-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Icons
const PlusIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4v16m8-8H4"
    ></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);

const ShareIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
    ></path>
  </svg>
);

export default Home;