import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthday: '',
    about: '',
    picture: '',
  });

  // Populate form with current user info
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        about: user.about || '',
        picture: user.picture || '',
      });
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
        name: formData.name,
        email: formData.email,
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
        about: formData.about,
        picture: formData.picture, // Treated as a URL string
      };

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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Edit Profile</h2>
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

          {/* Submit Button */}
          <div className="flex justify-end">
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