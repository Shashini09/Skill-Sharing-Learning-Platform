import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../context/AuthContext";
import { useParams } from 'react-router-dom';

export default function CommentPage() {
  const { user } = useAuth();
  const { postId } = useParams(); // Assumes postId from route like /post/1/comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/comments/${postId}`, {
        withCredentials: true,
      });
      
      
      

      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      postId: parseInt(postId),
      user: user?.name || 'Anonymous',
      text: commentText,
    };

    try {
      if (editingComment) {
        await axios.put(`http://localhost:8080/api/comments/${editingComment.id}`, payload,{
            withCredentials: true,
          });
      } else {
        await axios.post(`http://localhost:8080/api/comments`, payload,{
            withCredentials: true,
          });
      }
      setCommentText('');
      setEditingComment(null);
      fetchComments();
    } catch (err) {
      console.error("Error saving comment:", err);
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setCommentText(comment.text);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${id}`,{
        withCredentials: true,
      });
      fetchComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white mt-10 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Comments</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <textarea
          className="w-full border p-3 rounded-md"
          rows="3"
          placeholder="Write your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingComment ? "Update" : "Comment"}
          </button>
          {editingComment && (
            <button
              type="button"
              onClick={() => {
                setEditingComment(null);
                setCommentText('');
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border p-4 rounded-md shadow-sm">
            <div className="text-sm text-gray-600 mb-1">
              <strong>{comment.user}</strong> –{" "}
              {new Date(comment.timestamp).toLocaleString()}
            </div>
            <p className="text-gray-800 mb-2">{comment.text}</p>
            {comment.user === user?.name && (
              <div className="flex space-x-4 text-sm">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => handleEdit(comment)}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
