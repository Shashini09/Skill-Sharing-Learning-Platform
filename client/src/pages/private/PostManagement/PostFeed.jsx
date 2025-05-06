import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
<<<<<<< HEAD
=======

import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
>>>>>>> 9acab0346d04cc0a15654fd5177b4b8dfc373a79

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const userId = localStorage.getItem('userId') || 'user123';

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/posts/all', { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      toast.error('Failed to fetch posts');
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/delete/${id}`, { withCredentials: true });
        fetchPosts();

        toast.success('Post deleted successfully');
      } catch (err) {
        toast.error('Delete failed. Please try again.');

      }
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditValues({
<<<<<<< HEAD
      topic: post.topic,
      description: post.description,
      mediaUrls: post.mediaUrls,
      mediaTypes: post.mediaTypes,
      isPrivate: post.isPrivate,
      taggedFriends: post.taggedFriends,
      location: post.location
=======

      topic: post.topic || '',
      description: post.description || '',
      mediaUrls: post.mediaUrls || [],
      mediaTypes: post.mediaTypes || [],
      isPrivate: post.isPrivate || false,
      taggedFriends: post.taggedFriends?.join(', ') || '',
      location: post.location || ''

>>>>>>> 9acab0346d04cc0a15654fd5177b4b8dfc373a79
    });
  };

  const handleEditChange = (e) => {

    const { name, value, type, checked } = e.target;
    setEditValues({ 
      ...editValues, 
      [name]: type === 'checkbox' ? checked : value 
    });

  };

  const handleUpdate = async (id) => {
    try {

      // Process taggedFriends back to array if it's a string
      const processedValues = {
        ...editValues,
        taggedFriends: typeof editValues.taggedFriends === 'string' 
          ? editValues.taggedFriends.split(',').map(tag => tag.trim()).filter(Boolean)
          : editValues.taggedFriends
      };

      await axios.put(`http://localhost:8080/api/posts/update/${id}`, processedValues, {

        withCredentials: true
      });
      setEditingPostId(null);
      fetchPosts();

      toast.success('Post updated successfully');
    } catch (err) {
      toast.error('Update failed. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Post Feed</h2>
      {posts.map(post => (
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
              <button onClick={() => handleUpdate(post.id)} className="bg-green-500 text-white px-4 py-1 rounded mt-2">Save</button>
              <button onClick={() => setEditingPostId(null)} className="bg-gray-400 text-white px-4 py-1 rounded mt-2 ml-2">Cancel</button>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-lg">{post.topic}</h3>
              <p>{post.description}</p>
              <p className="text-sm text-gray-600">{new Date(post.timestamp).toLocaleString()}</p>
              {post.mediaUrls && post.mediaUrls.map((url, idx) => (
                post.mediaTypes[idx] === 'video' ? (
                  <video key={idx} controls src={url} className="w-full mt-2" />
                ) : (
<<<<<<< HEAD
                  <img key={idx} src={url} alt="media" className="w-full mt-2" />
                )
              ))}
          
                <div className="mt-2 flex gap-2">
                  <button onClick={() => startEdit(post)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                  <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
             
            </>
          )}
        </div>
      ))}
      <ToastContainer />
=======
                  <>
                    {/* Post Header with User Info */}
                    <div className="p-4 sm:p-6 flex justify-between items-start border-b border-gray-200">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
                          {post.userAvatar ? (
                            <img src={post.userAvatar} alt={post.userName || 'User'} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-gray-500">
                              {(post.userName || 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{post.userName || 'Anonymous'}</h3>
                          <div className="text-sm text-gray-500 flex flex-wrap items-center">
                            <span>{formatDate(post.timestamp)}</span>
                            {post.location && (
                              <span className="flex items-center ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {post.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Post Actions Dropdown */}
                      {user?.id === post.userId && (
                        <div className="relative group">
                          <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
                            <div className="py-1">
                              <button 
                                onClick={() => startEdit(post)} 
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(post.id)} 
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Post Content */}
                    <div className="p-4 sm:p-6">
                      {/* Topic */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{post.topic || 'Untitled'}</h2>
                      
                      {/* Description */}
                      <p className="text-gray-700 whitespace-pre-line mb-4">{post.description || ''}</p>
                      
                      {/* Private badge */}
                      {post.isPrivate && (
                        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Private
                        </div>
                      )}
                      
                      {/* Media Grid */}
                      {Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 && (
                        <div className={`grid ${post.mediaUrls.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'} mt-4`}>
                          {post.mediaUrls.map((url, idx) => (
                            post.mediaTypes?.[idx] === 'video' ? (
                              <div key={idx} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-sm">
                                <video 
                                  controls 
                                  src={url} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ) : (
                              <div key={idx} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-sm bg-gray-100">
                                <img 
                                  src={url} 
                                  alt={`Post media ${idx + 1}`} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            )
                          ))}
                        </div>
                      )}
                      
                      {/* Tagged Friends */}
                      {Array.isArray(post.taggedFriends) && post.taggedFriends.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-1">Tagged:</p>
                          <div className="flex flex-wrap gap-1">
                            {post.taggedFriends.map((friend, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5"
                              >
                                {friend}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Post Action Bar */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center text-gray-500 hover:text-blue-600 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center text-gray-500 hover:text-blue-600 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center text-gray-500 hover:text-blue-600 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                      {user?.id === post.userId && (
                        <div className="flex">
                          <button 
                            onClick={() => startEdit(post)} 
                            className="mr-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id)} 
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

>>>>>>> 9acab0346d04cc0a15654fd5177b4b8dfc373a79
    </div>
  );
};


export default PostFeed;


