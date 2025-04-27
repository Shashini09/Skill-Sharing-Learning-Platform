import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthday: '',
    about: '',
    picture: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from backend
  useEffect(() => {
    if (user && user.id) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8080/users/${user.id}`, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const userData = response.data;
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            birthday: userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
            about: userData.about || '',
            picture: userData.picture || '',
          });
          setLoading(false);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data. Please try again.');
          setLoading(false);
          // Fallback to AuthContext user data
          setFormData({
            name: user.name || '',
            email: user.email || '',
            birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
            about: user.about || '',
            picture: user.picture || '',
          });
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare JSON payload matching the User model
      const payload = {
        name: formData.name || user.name || '',
        email: formData.email || user.email || '',
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : user.birthday ? new Date(user.birthday).toISOString() : null,
        about: formData.about || user.about || '',
        picture: formData.picture || user.picture || '',
      };

      console.log('Payload being sent:', payload); // Debug log to inspect payload

      await axios.put(`http://localhost:8080/users/${user.id}`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`An error occurred: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your profile? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:8080/users/${user.id}`, {
          withCredentials: true,
        });
        alert("Profile deactivated successfully.");
        logout();
        navigate("/login");
      } catch (error) {
        console.error("Error deactivating profile:", error);
        alert(`An error occurred: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Edit Profile</h2>
        {loading && (
          <div className="text-center text-gray-600">
            <p>Loading user data...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture URL */}
          <div>
            <label htmlFor="picture" className="block text-sm font-medium text-gray-700">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="picture"
              name="picture"
              value={formData.picture}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {formData.picture && (
              <div className="mt-2">
                <img
                  src={formData.picture}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover"
                  onError={(e) => (e.target.src = '/placeholder-image.jpg')} // Fallback image
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          {/* Birthday */}
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
              Birthday
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* About */}
          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700">
              About
            </label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDeactivate}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Deactivate Profile
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}