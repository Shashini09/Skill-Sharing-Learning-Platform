import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditLearningPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    activities: [],
  });

  useEffect(() => {
    axios.get(`http://localhost:8080/api/learning-plans/${id}`)
      .then((response) => setPlan(response.data))
      .catch((error) => console.error('Error fetching plan:', error));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlan({ ...plan, [name]: value });
  };

  const handleActivityChange = (index, field, value) => {
    const updatedActivities = [...plan.activities];
    updatedActivities[index][field] = value;
    setPlan({ ...plan, activities: updatedActivities });
  };

  const handleResourceChange = (activityIndex, resourceIndex, field, value) => {
    const updatedActivities = [...plan.activities];
    updatedActivities[activityIndex].resources[resourceIndex][field] = value;
    setPlan({ ...plan, activities: updatedActivities });
  };

  const addActivity = () => {
    setPlan({
      ...plan,
      activities: [...plan.activities, { topic: '', description: '', resources: [] }],
    });
  };

  const removeActivity = (index) => {
    const updatedActivities = plan.activities.filter((_, i) => i !== index);
    setPlan({ ...plan, activities: updatedActivities });
  };

  const addResource = (activityIndex) => {
    const updatedActivities = [...plan.activities];
    updatedActivities[activityIndex].resources.push({ title: '', url: '' });
    setPlan({ ...plan, activities: updatedActivities });
  };

  const removeResource = (activityIndex, resourceIndex) => {
    const updatedActivities = [...plan.activities];
    updatedActivities[activityIndex].resources = updatedActivities[activityIndex].resources.filter((_, i) => i !== resourceIndex);
    setPlan({ ...plan, activities: updatedActivities });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/learning-plans/update/${id}`, plan);
      navigate('/learning-plans');
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-xl p-8">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Edit Learning Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={plan.title}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={plan.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block font-semibold mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={plan.startDate?.split('T')[0] || ''}
            onChange={handleChange}
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        {/* Activities */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mt-6">Activities</h3>
          {plan.activities.map((activity, activityIndex) => (
            <div key={activityIndex} className="border p-4 rounded-md shadow-sm space-y-4 bg-gray-50">
              <div>
                <label className="block font-semibold">Topic</label>
                <input
                  type="text"
                  value={activity.topic}
                  onChange={(e) => handleActivityChange(activityIndex, 'topic', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold">Description</label>
                <textarea
                  value={activity.description}
                  onChange={(e) => handleActivityChange(activityIndex, 'description', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  rows={2}
                />
              </div>

              {/* Resources */}
              <div>
                <label className="block font-semibold">Resources</label>
                {activity.resources.map((resource, resourceIndex) => (
                  <div key={resourceIndex} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={resource.title}
                      onChange={(e) =>
                        handleResourceChange(activityIndex, resourceIndex, 'title', e.target.value)
                      }
                      className="w-1/2 border rounded-md px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={resource.url}
                      onChange={(e) =>
                        handleResourceChange(activityIndex, resourceIndex, 'url', e.target.value)
                      }
                      className="w-1/2 border rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeResource(activityIndex, resourceIndex)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addResource(activityIndex)}
                  className="text-blue-600 hover:underline mt-1"
                >
                  + Add Resource
                </button>
              </div>

              {/* Remove Activity Button */}
              <button
                type="button"
                onClick={() => removeActivity(activityIndex)}
                className="text-red-600 hover:underline"
              >
                Remove Activity
              </button>
            </div>
          ))}

          {/* Add Activity Button */}
          <button
            type="button"
            onClick={addActivity}
            className="text-green-700 font-semibold hover:underline"
          >
            + Add Activity
          </button>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
          >
            Update Plan
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditLearningPlan;


