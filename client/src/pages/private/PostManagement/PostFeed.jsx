import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [comments, setComments] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [userLikes, setUserLikes] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  const getCommentCount = (postId) => {
    return comments[postId]?.length || 0;
  };

  const userName = user?.name || "Anonymous"; // Fallback if undefined
  const userId = user?.id || null; // Fallback if undefined

  const toggleComments = (postId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    // Fetch comments when opening
    if (!visibleComments[postId]) {
      fetchComments(postId);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/posts/all", {
        withCredentials: true,
        params: { filter, search: searchTerm },
      });
      const sortedPosts = res.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setPosts(sortedPosts);

      // Initialize all comments as hidden
      const initialVisibility = {};
      sortedPosts.forEach((post) => {
        initialVisibility[post.id] = false;
      });
      setVisibleComments(initialVisibility);

      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch posts");
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/comments/${postId}`,
        { withCredentials: true }
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      toast.error("Failed to fetch comments");
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:8080/api/comments`,

        { text: commentText, postId, user: userName }, // <-- include postId here

        { withCredentials: true }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }));
      setCommentText("");
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleUpdateComment = async (commentId, postId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/comments/${commentId}`,
        { text: editCommentText },
        { withCredentials: true }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].map((comment) =>
          comment.id === commentId
            ? { ...comment, text: editCommentText }
            : comment
        ),
      }));
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await axios.delete(`http://localhost:8080/api/comments/${commentId}`, {
        withCredentials: true,
      });
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((comment) => comment.id !== commentId),
      }));
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/likes`,
        {
          postId,
          userId: userId,
          user: userName,
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
      `http://localhost:8080/api/likes/${postId}/user/${userName}`,
      { withCredentials: true }
    );
    setUserLikes((prev) => ({ ...prev, [postId]: res.data }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:8080/api/posts/delete/${id}`, {
          withCredentials: true,
        });
        fetchPosts();

        toast.success("Post deleted successfully");
      } catch (err) {
        toast.error("Delete failed. Please try again.");
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post Feed</h1>
          <Link
            to="/createpost"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Post
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-4">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 mb-4"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setFilter("myPosts")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "myPosts"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setFilter("recent")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "recent"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setFilter("popular")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "popular"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Popular
            </button>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No posts found
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "myPosts"
                ? "You haven't created any posts yet."
                : searchTerm
                ? `No posts matching "${searchTerm}"`
                : "No posts are available at the moment."}
            </p>

            <Link
              to="/createpost"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Post Header with User Info */}
                <div className="p-4 sm:p-6 flex justify-between items-start border-b border-gray-200">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
                      {post.userAvatar ? (
                        <img
                          src={post.userAvatar}
                          alt={post.userName || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-500">
                          {(post.userName || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {post.userName || user?.name || "Anonymous"}
                      </h3>
                      <div className="text-sm text-gray-500 flex flex-wrap items-center">
                        <span>{formatDate(post.timestamp)}</span>
                        {post.location && (
                          <span className="flex items-center ml-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
                        <div className="py-1">
                          <Link
                            to={`/edit-post/${post.id}`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
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
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {post.topic || "Untitled"}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-700 whitespace-pre-line mb-4">
                    {post.description || ""}
                  </p>

                  {/* Private badge */}
                  {post.isPrivate && (
                    <div className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Private
                    </div>
                  )}

                  {/* Media Grid */}
                  {Array.isArray(post.mediaUrls) &&
                    post.mediaUrls.length > 0 && (
                      <div
                        className={`grid ${
                          post.mediaUrls.length > 1
                            ? "grid-cols-2 gap-2"
                            : "grid-cols-1"
                        } mt-4`}
                      >
                        {post.mediaUrls.map((url, idx) =>
                          post.mediaTypes?.[idx] === "video" ? (
                            <div
                              key={idx}
                              className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-sm"
                            >
                              <video
                                controls
                                src={url}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              key={idx}
                              className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-sm bg-gray-100"
                            >
                              <img
                                src={url}
                                alt={`Post media ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {/* Tagged Friends */}
                  {Array.isArray(post.taggedFriends) &&
                    post.taggedFriends.length > 0 && (
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

                  {/* Comments Section */}
                  {visibleComments[post.id] && (
                    <div className="mt-6 border-t border-gray-300 pt-6">
                      <form
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                        className="mb-6"
                      >
                        <textarea
                          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          required
                        />
                        <button
                          type="submit"
                          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
                        >
                          Post Comment
                        </button>
                      </form>

                      <ul className="space-y-4">
                        {(comments[post.id] || []).map((comment) => (
                          <li
                            key={comment.id}
                            className="p-4 bg-white rounded-xl shadow border border-gray-200"
                          >
                            <div className="text-sm text-gray-600 mb-2 flex justify-between items-center">
                              <span>
                                <strong className="text-blue-700">
                                  {comment.user}
                                </strong>{" "}
                                · {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>

                            {editingCommentId === comment.id ? (
                              <>
                                <textarea
                                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  value={editCommentText}
                                  onChange={(e) =>
                                    setEditCommentText(e.target.value)
                                  }
                                />
                                <div className="mt-2 flex gap-2">
                                  <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg"
                                    onClick={() =>
                                      handleUpdateComment(comment.id, post.id)
                                    }
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1 rounded-lg"
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-800 mb-2">
                                  {comment.text}
                                </p>
                                {comment.user === user?.name && (
                                  <div className="flex gap-4 text-sm">
                                    <button
                                      className="text-blue-600 hover:underline"
                                      onClick={() => handleEditComment(comment)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-red-600 hover:underline"
                                      onClick={() =>
                                        handleDeleteComment(comment.id, post.id)
                                      }
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
                    </div>
                  )}
                </div>

                {/* Post Action Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center transition ${
                        userLikes[post.id]
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-blue-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill={userLikes[post.id] ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      {userLikes[post.id] ? "Liked" : "Like"} (
                      {likeCounts[post.id] || 0})
                    </button>
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center text-gray-500 hover:text-blue-600 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-blue-600 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                  {user?.id === post.userId && (
                    <div className="flex">
                      <Link
                        to={`/edit-post/${post.id}`}
                        className="mr-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PostFeed;
