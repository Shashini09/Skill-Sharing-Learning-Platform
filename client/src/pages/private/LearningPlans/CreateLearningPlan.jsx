import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

export default function CreateLearningPlan() {
  const { user } = useAuth();
  const navigate = useNavigate(); // <-- add this

  const [learningPlan, setLearningPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    activities: [],
  });

  const [activity, setActivity] = useState({ topic: '', description: '', resources: [] });
  const [resource, setResource] = useState({ title: '', url: '' });
  const [message, setMessage] = useState('');

  const handlePlanChange = (e) => {
    setLearningPlan({ ...learningPlan, [e.target.name]: e.target.value });
  };

  const handleActivityChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleResourceChange = (e) => {
    setResource({ ...resource, [e.target.name]: e.target.value });
  };

  const addResource = () => {
    if (resource.title && resource.url) {
      setActivity((prev) => ({
        ...prev,
        resources: [...prev.resources, resource],
      }));
      setResource({ title: '', url: '' });
      setMessage('');
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
      setActivity({ topic: '', description: '', resources: [] });
      setResource({ title: '', url: '' });
      setMessage('');
    }
  };

  const removeActivity = (index) => {
    const updated = [...learningPlan.activities];
    updated.splice(index, 1);
    setLearningPlan({ ...learningPlan, activities: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return setMessage('You must be logged in to create a learning plan.');
    if (!learningPlan.title || !learningPlan.description || !learningPlan.startDate)
      return setMessage('Please fill in all learning plan details.');

    try {
      const dataToSend = {
        ...learningPlan,
        userid: user.id,
        startDate: new Date(learningPlan.startDate).toISOString(),
      };

      await axios.post('http://localhost:8080/api/learning-plans/create', dataToSend, {
        withCredentials: true,
      });

      setMessage('🎉 Learning Plan created successfully!');
      setLearningPlan({ title: '', description: '', startDate: '', activities: [] });
      setActivity({ topic: '', description: '', resources: [] });
      setResource({ title: '', url: '' });

      setTimeout(() => {
        navigate('/learning-plans'); // <-- navigate after short delay
      }, 1000);
    } catch (error) {
      setMessage('Error creating learning plan: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-10 px-5">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Learning Plan</h1>

        <div className="grid gap-4 mb-8">
          <input
            type="text"
            name="title"
            value={learningPlan.title}
            onChange={handlePlanChange}
            placeholder="Learning Plan Title"
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="description"
            value={learningPlan.description}
            onChange={handlePlanChange}
            placeholder="Short Description"
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="date"
            name="startDate"
            value={learningPlan.startDate}
            onChange={handlePlanChange}
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {learningPlan.activities.map((act, index) => (
          <div key={index} className="bg-gray-100 p-5 mb-5 rounded-xl shadow-sm border relative">
            <button
              onClick={() => removeActivity(index)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-600"
              title="Remove Activity"
            >
              <Trash2 size={20} />
            </button>
            <h3 className="font-bold text-gray-700 mb-2">Activity {index + 1}</h3>
            <p className="mb-1"><strong>Topic:</strong> {act.topic}</p>
            <p className="mb-2"><strong>Description:</strong> {act.description}</p>
            {act.resources.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-blue-700">
                {act.resources.map((res, idx) => (
                  <li key={idx}>
                    <strong>{res.title}</strong>:&nbsp;
                    <a href={res.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {res.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="bg-white p-6 rounded-xl mb-8 border border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">New Activity</h2>

          <input
            type="text"
            name="topic"
            value={activity.topic}
            onChange={handleActivityChange}
            placeholder="Activity Topic"
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            name="description"
            value={activity.description}
            onChange={handleActivityChange}
            placeholder="Activity Description"
            className="w-full p-2 mb-4 border rounded"
          />

          <div>
            <h3 className="text-gray-700 font-medium mb-2">Resources</h3>
            {activity.resources.map((res, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border mb-2">
                <div>
                  <strong>{res.title}</strong>:&nbsp;
                  <a href={res.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                    {res.url}
                  </a>
                </div>
                <button onClick={() => removeResource(index)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                name="title"
                value={resource.title}
                onChange={handleResourceChange}
                placeholder="Resource Title"
                className="flex-1 p-2 border rounded"
              />
              <input
                type="text"
                name="url"
                value={resource.url}
                onChange={handleResourceChange}
                placeholder="Resource URL"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={addResource}
                disabled={!resource.title || !resource.url}
                className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={addActivity}
            disabled={!activity.topic || !activity.description}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded disabled:bg-blue-300"
          >
            Add Activity
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
        >
          Create Learning Plan
        </button>

        {message && (
          <p className="mt-6 text-center text-sm font-medium text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
