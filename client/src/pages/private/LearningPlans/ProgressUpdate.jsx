import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Save, X, BookOpen } from 'lucide-react';

const CreateProgressUpdate = () => {
  const { user } = useAuth();
  const { id } = useParams(); // Get the learning plan ID from the URL
  const navigate = useNavigate(); // Hook for navigation
  const [formData, setFormData] = useState({
    templateType: '',
    content: '',
    learningPlanLink: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Set the learningPlanLink when the component mounts or id changes
  useEffect(() => {
    if (id) {
      // Construct the learning plan URL using the ID from the URL
      const constructedLink = `http://localhost:8080/learning-plans/${id}`;
      setFormData(prev => ({
        ...prev,
        learningPlanLink: constructedLink
      }));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateLearningPlanLink = (link) => {
    try {
      const url = new URL(link);
      const pathSegments = url.pathname.split('/');
      const id = pathSegments[pathSegments.length - 1];
      if (!id || id.trim() === '') {
        return { valid: false, error: 'Learning plan link must contain a valid ID.' };
      }
      // Basic MongoDB ObjectId validation (24-character hex string)
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!objectIdPattern.test(id)) {
        return { valid: false, error: 'Learning plan ID must be a valid MongoDB ObjectId.' };
      }
      return { valid: true, id };
    } catch (err) {
      return { valid: false, error: 'Invalid learning plan link format. Please provide a valid URL.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a progress update.');
      return;
    }
    if (!formData.templateType || !formData.content || !formData.learningPlanLink) {
      setError('All fields are required.');
      return;
    }

    // Validate learningPlanLink
    const validationResult = validateLearningPlanLink(formData.learningPlanLink);
    if (!validationResult.valid) {
      setError(validationResult.error);
      return;
    }
    const learningPlanId = validationResult.id;

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        'http://localhost:8080/api/progress-updates/create',
        {
          userId: user.id,
          templateType: formData.templateType,
          content: formData.content,
          learningPlanId: learningPlanId
        },
        { withCredentials: true }
      );

      setSuccess('Progress update created successfully!');
      setFormData({
        templateType: '',
        content: '',
        learningPlanLink: id ? `http://localhost:8080/learning-plans/${id}` : ''
      });
      // Redirect to /progress-feed after successful submission
      navigate('/progress-feed');
    } catch (err) {
      console.error('Error creating progress update:', err);
      let errorMessage = 'Failed to create progress update. Please try again.';
      if (err.response) {
        console.log('Response data:', err.response.data);
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data === 'Learning Plan not found'
            ? 'The specified learning plan does not exist. Please check the link and try again.'
            : err.response.data;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check if the backend is running.';
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      templateType: '',
      content: '',
      learningPlanLink: id ? `http://localhost:8080/learning-plans/${id}` : ''
    });
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to create a progress update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-xl border border-gray-100">
          <div className="h-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-t-xl"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen size={24} className="text-purple-600 mr-2" />
                Create Learning Plan Progress Update
              </h2>
              <button
                onClick={handleCancel}
                className="bg-gray-50 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                <select
                  name="templateType"
                  value={formData.templateType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a type</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Completion">Completion</option>
                  <option value="Note">Note</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your progress update..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Learning Plan Link</label>
                <input
                  type="url"
                  name="learningPlanLink"
                  value={formData.learningPlanLink}
                  onChange={handleChange}
                  placeholder="https://example.com/learning-plans/1234567890abcdef12345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  Save Progress Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProgressUpdate;