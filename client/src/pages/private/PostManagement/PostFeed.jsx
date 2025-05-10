import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const userId = localStorage.getItem('userId') || 'user123';

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/posts/all', { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      toast.error('Failed to fetch posts');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/delete/${id}`, {
          withCredentials: true,
        });
        fetchPosts();
        toast.success('Post deleted');
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditValues({
      topic: post.topic,
      description: post.description,
      mediaUrls: post.mediaUrls,
      mediaTypes: post.mediaTypes,
      isPrivate: post.isPrivate,
      taggedFriends: post.taggedFriends,
      location: post.location,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues({ ...editValues, [name]: value });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/posts/update/${id}`, editValues, {
        withCredentials: true,
      });
      setEditingPostId(null);
      fetchPosts();
      toast.success('Post updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Post Feed</h2>
      {posts.map((post) => (
        <div key={post.id} className="border rounded p-4 mb-4">
          {editingPostId === post.id ? (
            <>
           
              <input
                name="topic"
                value={editValues.topic}
                onChange={handleEditChange}
                className="w-full border p-2 mb-2"
              />
              <textarea
                name="description"
                value={editValues.description}
                onChange={handleEditChange}
                className="w-full border p-2"
              />
              <button
                onClick={() => handleUpdate(post.id)}
                className="bg-green-500 text-white px-4 py-1 rounded mt-2"
              >
                Save
              </button>
              <button
                onClick={() => setEditingPostId(null)}
                className="bg-gray-400 text-white px-4 py-1 rounded mt-2 ml-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-lg">{post.topic}</h3>
              <p>{post.description}</p>
              <p className="text-sm text-gray-600">
                {new Date(post.timestamp).toLocaleString()}
              </p>

              {post.mediaUrls?.map((url, idx) =>
                post.mediaTypes[idx] === 'video' ? (
                  <video key={idx} controls src={url} className="w-full mt-2" />
                ) : (
                  <img key={idx} src={url} alt="media" className="w-full mt-2" />
                )
              )}

              {String(post.userId) === String(userId) && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => startEdit(post)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
      <ToastContainer />
    </div>
  );
};

export default PostFeed;
