import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Pencil, Trash2, X, Plus, BookOpen, Calendar, ExternalLink, Search } from 'lucide-react';

function LearningPlanList() {
  const { user } = useAuth();
  const [learningPlans, setLearningPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      axios.get(`http://localhost:8080/api/learning-plans/all?userId=${user.id}`, { withCredentials: true })
        .then((res) => {
          setLearningPlans(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching learning plans:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this learning plan?')) {
      try {
        await axios.delete(`http://localhost:8080/api/learning-plans/delete/${id}`, { withCredentials: true });
        setLearningPlans((prev) => prev.filter((plan) => plan.id !== id));
        setSelectedPlan(null);
      } catch (error) {
        console.error('Error deleting learning plan:', error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-learning-plan/${id}`);
  };

  const filteredPlans = searchTerm 
    ? learningPlans.filter(plan => 
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : learningPlans;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-purple-600 rounded-full mb-2"></div>
          <p className="text-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view and manage your learning plans.</p>
          <Link to="/login" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
              My Learning Plans
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              <Link
                to="/create-learning-plans"
                className="flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition-all"
              >
                <Plus size={20} className="mr-2" />
                <span>New Plan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Plan Cards */}
          <div className="w-full lg:w-3/5">
            {filteredPlans.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm ? "No matching plans found" : "No learning plans yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Try a different search term or clear your search"
                    : "Create your first learning plan to start organizing your educational journey"}
                </p>
                <Link
                  to="/create-learning-plans"
                  className="inline-flex items-center text-purple-600 font-medium hover:text-purple-800"
                >
                  <Plus size={18} className="mr-1" />
                  Create your first plan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`cursor-pointer bg-white shadow-md rounded-xl border border-gray-100 transition-all duration-300 overflow-hidden hover:shadow-lg transform hover:-translate-y-1 ${
                      selectedPlan?.id === plan.id ? "ring-2 ring-purple-500" : ""
                    }`}
                  >
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700"></div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-gray-800">{plan.title}</h2>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={16} className="mr-1" />
                          {new Date(plan.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{plan.description}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          {plan.activities?.length || 0} activities
                        </span>
                        <span className="text-sm text-purple-600 font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected Plan */}
          <div className="w-full lg:w-2/5">
            {selectedPlan ? (
              <div className="bg-white shadow-xl rounded-xl border border-gray-100 sticky top-4">
                <div className="h-3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-t-xl"></div>
                <div className="p-6 relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>

                  {/* Action Icons */}
                  <div className="absolute top-6 right-6 flex space-x-2">
                    <button 
                      onClick={() => handleEdit(selectedPlan.id)} 
                      className="bg-amber-50 p-2 rounded-full text-amber-500 hover:bg-amber-100 transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedPlan.id)} 
                      className="bg-red-50 p-2 rounded-full text-red-500 hover:bg-red-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-6 pt-2">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPlan.title}</h2>
                      <p className="text-gray-600">{selectedPlan.description}</p>
                    </div>
                    
                    <div className="flex items-center px-4 py-3 bg-purple-50 rounded-lg">
                      <Calendar size={20} className="text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium text-gray-800">
                          {new Date(selectedPlan.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <BookOpen size={18} className="mr-2 text-purple-600" />
                        Activities
                      </h3>
                      
                      {selectedPlan.activities?.length > 0 ? (
                        <div className="space-y-4">
                          {selectedPlan.activities.map((activity, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                                <h4 className="font-medium text-gray-800">{activity.topic}</h4>
                              </div>
                              <div className="p-4">
                                <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                                
                                {activity.resources?.length > 0 && (
                                  <div>
                                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Resources</p>
                                    <ul className="space-y-2">
                                      {activity.resources.map((res, i) => (
                                        <li key={i} className="flex items-center">
                                          <ExternalLink size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                                          <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 text-sm truncate"
                                          >
                                            {res.title}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">No activities added yet</p>
                          <button
                            onClick={() => handleEdit(selectedPlan.id)}
                            className="mt-2 text-purple-600 text-sm font-medium hover:text-purple-800"
                          >
                            Add activities
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={24} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Plan Details</h3>
                <p className="text-gray-500 mb-6">Select a learning plan to view its details</p>
                {learningPlans.length > 0 && (
                  <p className="text-sm text-gray-400">
                    You have {learningPlans.length} learning plan{learningPlans.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningPlanList;