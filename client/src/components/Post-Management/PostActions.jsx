import React, { useState } from 'react';
import { FaThumbsUp, FaCommentAlt, FaShare } from 'react-icons/fa';

const PostActions = ({
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  onLike,
  onComment,
  onShare
}) => {
  // Local state to toggle liked status and update the like count
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  // Handle like button click
  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1);
      setLiked(true);
      if (onLike) {
        onLike(postId, true);
      }
    } else {
      setLikes(likes - 1);
      setLiked(false);
      if (onLike) {
        onLike(postId, false);
      }
    }
  };

  // Handle comment button click – you can open a comment modal, or scroll to the comment section
  const handleComment = () => {
    if (onComment) {
      onComment(postId);
    }
  };

  // Handle share button click – perhaps open a sharing dialog or trigger share functionality
  const handleShare = () => {
    if (onShare) {
      onShare(postId);
    }
  };

  return (
    <div className="flex items-center space-x-6 p-2 border-t mt-2">
      <button
        onClick={handleLike}
        className={`flex items-center space-x-1 ${liked ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500`}
      >
        <FaThumbsUp size={18} />
        <span>{likes}</span>
      </button>
      <button
        onClick={handleComment}
        className="flex items-center space-x-1 text-gray-600 hover:text-green-500"
      >
        <FaCommentAlt size={18} />
        <span>{initialComments}</span>
      </button>
      <button
        onClick={handleShare}
        className="flex items-center space-x-1 text-gray-600 hover:text-purple-500"
      >
        <FaShare size={18} />
        <span>{initialShares}</span>
      </button>
    </div>
  );
};

export default PostActions;
