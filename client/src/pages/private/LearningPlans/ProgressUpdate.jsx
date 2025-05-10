import React, { useState, useEffect } from 'react';
import { Clock, User, BookOpen, Mail, FileText } from 'lucide-react';

export default function ProgressUpdate() {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressUpdates = async () => {
      try {
        // Using fetch instead of axios
        const response = await fetch('http://localhost:8080/api/progress-updates/all', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Progress updates endpoint not found. Please check the backend configuration.');
          }
          throw new Error(`Failed to fetch progress updates: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Sort updates in descending order (newest first)
        const sortedUpdates = [...data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setProgressUpdates(sortedUpdates);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch progress updates');
        setLoading(false);
      }
    };

    fetchProgressUpdates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Progress Updates</h1>
      
      {progressUpdates.length === 0 ? (
        <div className="bg-purple-50 shadow rounded-lg p-6 text-center border border-purple-100">
          <p className="text-purple-500">No progress updates available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progressUpdates.map((update) => (
            <div
              key={update.id}
              className="bg-white shadow rounded-lg overflow-hidden transition-all hover:shadow-md border-l-4 border-purple-400"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-purple-700">
                      {update.user.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center text-purple-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(update.createdAt)}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-purple-700 mb-2">
                    {update.templateType}
                  </h2>
                  <p className="text-gray-600">{update.content}</p>
                </div>
                
                <div className="pt-4 border-t border-purple-100">
                  <div className="flex flex-wrap gap-y-2">
                    <div className="flex items-center mr-6">
                      <Mail className="h-4 w-4 text-purple-400 mr-1" />
                      <span className="text-sm text-gray-500">{update.user.email || 'No email'}</span>
                    </div>
                    {update.learningPlan?.title && (
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-purple-400 mr-1" />
                        <span className="text-sm text-gray-500">{update.learningPlan.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}