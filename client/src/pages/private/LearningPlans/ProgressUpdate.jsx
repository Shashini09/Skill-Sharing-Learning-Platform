import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { BookOpen, AlertCircle } from 'lucide-react';

const ProgressUpdate = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setError('You must be logged in to view progress updates.');
      setLoading(false);
      return;
    }

    const fetchProgressUpdates = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/progress-updates/user/${user.id}`,
          { withCredentials: true }
        );
        setUpdates(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching progress updates:', err);
        let errorMessage = 'Failed to fetch progress updates. Please try again.';
        if (err.response) {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressUpdates();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your progress updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-xl border border-gray-100">
          <div className="h-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-t-xl"></div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
              <BookOpen size={24} className="text-purple-600 mr-2" />
              My Progress Updates
            </h2>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : updates.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 text-lg">No progress updates found.</p>
                <p className="text-gray-500">Start by creating a new progress update!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {update.templateType}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(update.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{update.content}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Learning Plan ID: </span>
                      {update.learningPlan.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressUpdate;