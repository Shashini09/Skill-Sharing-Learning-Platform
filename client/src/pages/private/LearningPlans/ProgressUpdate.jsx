import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProgressUpdate() {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressUpdates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/progress-updates/all', {
          withCredentials: true,
        });
        setProgressUpdates(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Progress updates endpoint not found. Please check the backend configuration.');
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to fetch progress updates');
        }
        setLoading(false);
      }
    };

    fetchProgressUpdates();
  }, []);

  console.log(progressUpdates);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Progress Updates</h1>
      {progressUpdates.length === 0 ? (
        <p>No progress updates available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {progressUpdates.map((update) => (
            <li
              key={update.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <p><strong>Content:</strong> {update.content}</p>
              <p><strong>Template Type:</strong> {update.templateType}</p>
              <p><strong>User:</strong> {update.user.name || 'Unknown'}</p>
              <p><strong>User:</strong> {update.user.email || 'email'}</p>
              <p><strong>Learning Plan:</strong> {update.learningPlan?.title || 'Unknown'}</p>
              <p>
                <strong>Created At:</strong>{' '}
                {new Date(update.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}