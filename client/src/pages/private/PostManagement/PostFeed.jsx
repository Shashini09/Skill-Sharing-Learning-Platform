import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaCommentDots } from 'react-icons/fa'; // Comment icon

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [visibleComments, setVisibleComments] = useState({}); // postId: boolean
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({}); // postId: [comments]
  const [editingCommentId, setEditingCommentId] = useState(null);
const [editCommentText, setEditCommentText] = useState('');


  const userId = localStorage.getItem('userId') || 'user123';
  const userName = localStorage.getItem('userName') || 'Anonymous';

  const [likeCounts, setLikeCounts] = useState({});
const [userLikes, setUserLikes] = useState({});



  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/posts/all', { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      toast.error('Failed to fetch posts');
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/likes`,
        {
          postId,
          userId,
          timestamp: new Date().toISOString(),
        },
        { withCredentials: true }
      );
      fetchLikeCount(postId);
      fetchUserLiked(postId);
    } catch {
      toast.error("Like failed");
    }
  };
  
  const fetchLikeCount = async (postId) => {
    const res = await axios.get(
      `http://localhost:8080/api/likes/${postId}/count`,
      { withCredentials: true }
    );
    setLikeCounts((prev) => ({ ...prev, [postId]: res.data }));
  };
  
  const fetchUserLiked = async (postId) => {
    const res = await axios.get(
      `http://localhost:8080/api/likes/${postId}/user/${userId}`,
      { withCredentials: true }
    );
    setUserLikes((prev) => ({ ...prev, [postId]: res.data }));
  };
  
  

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/comments/${postId}`, {
        withCredentials: true,
      });
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      toast.error('Failed to fetch comments');
    }
  };

  const toggleComments = (postId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    if (!comments[postId]) {
      fetchComments(postId);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/comments`, {
        postId,
        user: userName,
        text: commentText,
      }, {
        withCredentials: true,
      });
      setCommentText('');
      fetchComments(postId);
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/delete/${id}`, { withCredentials: true });
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
      location: post.location
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditValues({ ...editValues, [name]: value });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/posts/update/${id}`, editValues, {
        withCredentials: true
      });
      setEditingPostId(null);
      fetchPosts();
      toast.success('Post updated');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (window.confirm("Delete this comment?")) {
      try {
        await axios.delete(`http://localhost:8080/api/comments/${commentId}`,{ withCredentials: true });
        fetchComments(postId);
        toast.success("Comment deleted");
      } catch (err) {
        toast.error("Failed to delete comment");
      }
    }
  };
  
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };
  
  const handleUpdateComment = async (commentId, postId) => {
    try {
      await axios.put(`http://localhost:8080/api/comments/${commentId}`, 
        { text: editCommentText }, 
        { withCredentials: true }
      );
      
      
      setEditingCommentId(null);
      setEditCommentText('');
      fetchComments(postId);
      toast.success("Comment updated");
    } catch (err) {
      toast.error("Failed to update comment");
    }
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
                  <img key={idx} src={url} alt="media" className="w-full mt-2" />
                )
              ))}
              <div className="mt-2 flex gap-4 items-center">
                {post.userId === userId && (
                  <>
                    <button onClick={() => startEdit(post)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                    <button onClick={() => handleDelete(post.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                  </>
                )}
                <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1 text-blue-600 hover:underline">
                  <FaCommentDots /> Comments
                </button>
              </div>

              {/* Comments Section */}
              {visibleComments[post.id] && (
                <div className="mt-4 border-t pt-4">
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="mb-4">
                    <textarea
                      className="w-full border p-2 rounded"
                      rows="2"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                    />
                    <button type="submit" className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Post</button>
                  </form>

                  <ul className="space-y-2">
  {(comments[post.id] || []).map((comment) => (
    <li key={comment.id} className="border p-3 rounded bg-gray-50">
      <div className="text-sm text-gray-700 mb-1">
        <strong>{comment.user}</strong> – {new Date(comment.timestamp).toLocaleString()}
      </div>

      {editingCommentId === comment.id ? (
        <>
          <textarea
            className="w-full border rounded p-2"
            value={editCommentText}
            onChange={(e) => setEditCommentText(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-3 py-1 rounded mt-2"
            onClick={() => handleUpdateComment(comment.id, post.id)}
          >
            Save
          </button>
          <button
            className="bg-gray-400 text-white px-3 py-1 rounded mt-2 ml-2"
            onClick={() => setEditingCommentId(null)}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <p>{comment.text}</p>
          {comment.user === userName && (
            <div className="flex gap-3 mt-2">
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleEditComment(comment)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:underline"
                onClick={() => handleDeleteComment(comment.id, post.id)}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </li>
  ))}
</ul>

                  <button
  onClick={() => handleLike(post.id)}
  className={`px-3 py-1 rounded ${userLikes[post.id] ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
>
  {userLikes[post.id] ? 'Liked' : 'Like'} ({likeCounts[post.id] || 0})
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
