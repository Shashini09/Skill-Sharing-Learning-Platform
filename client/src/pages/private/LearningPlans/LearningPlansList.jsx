import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Pencil, Trash2, X, Plus } from 'lucide-react';

function LearningPlanList() {
  const { user } = useAuth();
  const [learningPlans, setLearningPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-lg">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col md:flex-row">
      
      {/* Left: Plan Cards */}
      <div className="w-full md:w-2/3 pr-4">
        {/* Title and Create Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Learning Plans</h1>
          <Link
            to="/create-learning-plans"
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
          >
            <Plus size={20} className="mr-2" />
            Create Learning Plan
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className="cursor-pointer bg-white shadow-md p-5 rounded-xl border hover:shadow-lg transition duration-200"
            >
              <h2 className="text-xl font-bold text-blue-700 mb-2">{plan.title}</h2>
              <p className="text-gray-600 truncate">{plan.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Selected Plan */}
      {selectedPlan && (
        <div className="w-full md:w-1/3 bg-white shadow-2xl rounded-2xl p-6 mt-6 md:mt-0 relative">
          {/* Close Button */}
          <button
            onClick={() => setSelectedPlan(null)}
            className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow hover:bg-gray-200 transition"
          >
            <X size={20} />
          </button>

          {/* Action Icons */}
          <div className="absolute top-4 right-4 flex space-x-3">
            <button onClick={() => handleEdit(selectedPlan.id)} className="text-yellow-500 hover:text-yellow-600">
              <Pencil size={20} />
            </button>
            <button onClick={() => handleDelete(selectedPlan.id)} className="text-red-500 hover:text-red-600">
              <Trash2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-800">{selectedPlan.title}</h2>
            <p className="text-gray-700">
              <strong className="text-blue-600">Description:</strong> {selectedPlan.description}
            </p>
            <p className="text-gray-700">
              <strong className="text-blue-600">Start Date:</strong> {new Date(selectedPlan.startDate).toLocaleDateString()}
            </p>

            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Activities</h3>
              <ul className="space-y-4">
                {selectedPlan.activities?.map((activity, index) => (
                  <li key={index} className="bg-gray-100 p-4 rounded-xl shadow-sm">
                    <p className="mb-1"><strong>Topic:</strong> {activity.topic}</p>
                    <p className="mb-2"><strong>Description:</strong> {activity.description}</p>
                    {activity.resources?.length > 0 && (
                      <div className="ml-2">
                        <p className="font-semibold text-blue-600 mb-1">Resources:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.resources.map((res, i) => (
                            <li key={i}>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {res.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningPlanList;
