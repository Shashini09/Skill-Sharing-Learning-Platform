import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  CalendarDays, 
  FileText, 
  Library, 
  CheckCircle, 
  X, 
  Link as LinkIcon 
} from 'lucide-react';

export default function CreateLearningPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [learningPlan, setLearningPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    activities: [],
  });

  const [activity, setActivity] = useState({ topic: '', description: '', resources: [] });
  const [resource, setResource] = useState({ title: '', url: '' });
  const [progressUpdate, setProgressUpdate] = useState({ templateType: '', content: '' });
  const [error, setError] = useState('');
  const [learningPlanId, setLearningPlanId] = useState(null); // Store learning plan ID
  const [showPlanSuccessModal, setShowPlanSuccessModal] = useState(false);
  const [showActivitySuccessModal, setShowActivitySuccessModal] = useState(false);
  const [showProgressSuccessModal, setShowProgressSuccessModal] = useState(false);

  const handlePlanChange = (e) => {
    setLearningPlan({ ...learningPlan, [e.target.name]: e.target.value });
    setError('');
  };

  const handleActivityChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
    setError('');
  };

  const handleResourceChange = (e) => {
    setResource({ ...resource, [e.target.name]: e.target.value });
    setError('');
  };

  const handleProgressChange = (e) => {
    setProgressUpdate({ ...progressUpdate, [e.target.name]: e.target.value });
    setError('');
  };

  const addResource = () => {
    if (resource.title && resource.url) {
      setActivity((prev) => ({
        ...prev,
        resources: [...prev.resources, resource],
      }));
      setResource({ title: '', url: '' });
      setError('');
    }
  };

  const removeResource = (index) => {
    const updated = [...activity.resources];
    updated.splice(index, 1);
    setActivity({ ...activity, resources: updated });
  };

  const addActivity = () => {
    if (activity.topic && activity.description) {
      setLearningPlan((prev) => ({
        ...prev,
        activities: [...prev.activities, activity],
      }));
      setShowActivitySuccessModal(true);
      setTimeout(() => {
        setShowActivitySuccessModal(false);
      }, 1500);
      setActivity({ topic: '', description: '', resources: [] });
      setResource({ title: '', url: '' });
      setError('');
    } else {
      setError('Please provide both topic and description for the activity');
    }
  };

  const removeActivity = (index) => {
    const updated = [...learningPlan.activities];
    updated.splice(index, 1);
    setLearningPlan({ ...learningPlan, activities: updated });
  };

  const handleSubmitLearningPlan = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('You must be logged in to create a learning plan.');
      return;
    }
    if (!learningPlan.title || !learningPlan.description || !learningPlan.startDate) {
      setError('Please fill in all learning plan details.');
      return;
    }

    try {
      const dataToSend = {
        ...learningPlan,
        userid: user.id,
        startDate: new Date(learningPlan.startDate).toISOString(),
      };

      const response = await axios.post('http://localhost:8080/api/learning-plans/create', dataToSend, {
        withCredentials: true,
      });

      setLearningPlanId(response.data.id); // Store the learning plan ID
      setShowPlanSuccessModal(true);
      setLearningPlan({ title: '', description: '', startDate: '', activities: [] });
      setActivity({ topic: '', description: '', resources: [] });
      setResource({ title: '', url: '' });
      setError('');

      // Keep the form open to allow adding a progress update
      setTimeout(() => {
        setShowPlanSuccessModal(false);
      }, 2000);
    } catch (error) {
      setError('Error creating learning plan: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitProgressUpdate = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('You must be logged in to create a progress update.');
      return;
    }
    if (!progressUpdate.templateType || !progressUpdate.content) {
      setError('Please provide both template type and content for the progress update.');
      return;
    }
    if (!learningPlanId) {
      setError('No learning plan selected. Please create a learning plan first.');
      return;
    }

    try {
      const progressData = {
        userId: user.id,
        templateType: progressUpdate.templateType,
        content: progressUpdate.content,
        learningPlanId: learningPlanId,
      };

      await axios.post('http://localhost:8080/api/progress-updates/create', progressData, {
        withCredentials: true,
      });

      setShowProgressSuccessModal(true);
      setProgressUpdate({ templateType: '', content: '' });
      setError('');

      setTimeout(() => {
        setShowProgressSuccessModal(false);
        navigate('/learning-plans');
      }, 2000);
    } catch (error) {
      setError('Error creating progress update: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-5">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center justify-center mb-8">
          <BookOpen className="text-indigo-600 mr-3" size={28} />
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
            Create Learning Plan
          </h1>
        </div>

        {/* Learning Plan Form */}
        <div className="space-y-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FileText className="text-indigo-500" size={18} />
            </div>
            <input
              type="text"
              name="title"
              value={learningPlan.title}
              onChange={handlePlanChange}
              placeholder="Enter your learning plan title..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="relative group">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <Library className="text-indigo-500" size={18} />
            </div>
            <textarea
              name="description"
              value={learningPlan.description}
              onChange={handlePlanChange}
              placeholder="Describe what you want to learn and achieve with this plan..."
              rows="4"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <CalendarDays className="text-indigo-500" size={18} />
            </div>
            <input
              type="date"
              name="startDate"
              value={learningPlan.startDate}
              onChange={handlePlanChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Activities List */}
        {learningPlan.activities.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="mr-2 text-indigo-500" size={18} />
              Your Learning Activities
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {learningPlan.activities.map((act, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-white to-indigo-50 p-5 rounded-xl shadow-sm border border-indigo-100 relative hover:shadow-md transition-all duration-200"
                >
                  <button
                    onClick={() => removeActivity(index)}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm hover:shadow transition-all"
                    title="Remove Activity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <h3 className="font-bold text-indigo-700 mb-2">{act.topic}</h3>
                  <p className="mb-3 text-gray-600 text-sm">{act.description}</p>
                  {act.resources.length > 0 && (
                    <div className="mt-3 bg-white p-3 rounded-lg border border-indigo-50">
                      <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center">
                        <LinkIcon size={12} className="mr-1" /> Resources
                      </h4>
                      <ul className="space-y-2">
                        {act.resources.map((res, idx) => (
                          <li key={idx} className="text-sm flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                            <a 
                              href={res.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                              title={res.url}
                            >
                              {res.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Activity Form */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl mb-8 border border-indigo-100 shadow-sm">
          <h2 className="text-xl font-semibold text-indigo-700 mb-5 flex items-center">
            <Plus className="mr-2" size={18} />
            Add New Activity
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              name="topic"
              value={activity.topic}
              onChange={handleActivityChange}
              placeholder="What topic will you learn?"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <textarea
              name="description"
              value={activity.description}
              onChange={handleActivityChange}
              placeholder="Describe what you'll learn in this activity..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              rows="3"
            />
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-700 font-medium mb-3 flex items-center">
                <Library className="mr-2 text-indigo-500" size={16} />
                Learning Resources
              </h3>
              {activity.resources.length > 0 && (
                <div className="mb-4 space-y-2">
                  {activity.resources.map((res, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border hover:bg-blue-50 transition-colors">
                      <div className="flex items-center overflow-hidden">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <LinkIcon size={14} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-gray-800 truncate">{res.title}</p>
                          <a 
                            href={res.url} 
                            className="text-xs text-blue-600 hover:underline truncate block" 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            {res.url}
                          </a>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeResource(index)} 
                        className="ml-2 flex-shrink-0 text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm hover:shadow transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="title"
                  value={resource.title}
                  onChange={handleResourceChange}
                  placeholder="Resource Name"
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="url"
                  value={resource.url}
                  onChange={handleResourceChange}
                  placeholder="https://..."
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  onClick={addResource}
                  disabled={!resource.title || !resource.url}
                  className="bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 disabled:bg-indigo-300 transition-colors flex items-center justify-center whitespace-nowrap"
                >
                  <Plus size={16} className="mr-1" />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={addActivity}
            disabled={!activity.topic || !activity.description}
            className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:bg-indigo-300 transition-all duration-200 flex items-center justify-center"
          >
            <Plus size={16} className="mr-1" />
            Add Activity 
          </button>
        </div>

        {/* Submit Learning Plan Button */}
        <button
          onClick={handleSubmitLearningPlan}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg mb-8"
        >
          Create Learning Plan
        </button>

        {/* Progress Update Form (Shown after Learning Plan Creation) */}
        {learningPlanId && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl mb-8 border border-indigo-100 shadow-sm">
            <h2 className="text-xl font-semibold text-indigo-700 mb-5 flex items-center">
              <FileText className="mr-2" size={18} />
              Add Progress Update
            </h2>
            <div className="space-y-4">
              <select
                name="templateType"
                value={progressUpdate.templateType}
                onChange={handleProgressChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select Template Type</option>
                <option value="weekly">Weekly Update</option>
                <option value="milestone">Milestone Update</option>
                <option value="completion">Completion Update</option>
              </select>
              <textarea
                name="content"
                value={progressUpdate.content}
                onChange={handleProgressChange}
                placeholder="Describe your progress..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                rows="4"
              />
            </div>
            <button
              onClick={handleSubmitProgressUpdate}
              disabled={!progressUpdate.templateType || !progressUpdate.content}
              className="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:bg-indigo-300 transition-all duration-200 flex items-center justify-center"
            >
              <Plus size={16} className="mr-1" />
              Add Progress Update
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Success Modal for Learning Plan Creation */}
        {showPlanSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform animate-popup">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
                <p className="text-gray-600">Learning plan created successfully!</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Toast for Activity Addition */}
        {showActivitySuccessModal && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-green-100 p-4 flex items-center space-x-3 animate-slideIn">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-gray-700">Activity added successfully!</p>
            </div>
          </div>
        )}

        {/* Success Toast for Progress Update */}
        {showProgressSuccessModal && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-green-100 p-4 flex items-center space-x-3 animate-slideIn">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-gray-700">Progress update added successfully!</p>
            </div>
          </div>
        )}

        {/* Custom Animations */}
        <style jsx>{`
          @keyframes popup {
            0% { opacity: 0; transform: scale(0.9); }
            70% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes slideIn {
            0% { opacity: 0; transform: translateX(30px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          
          .animate-popup {
            animation: popup 0.4s ease-out forwards;
          }
          
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}