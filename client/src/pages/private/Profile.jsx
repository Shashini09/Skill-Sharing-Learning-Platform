import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const Profile = () => {
  const { user, logout } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navigate = useNavigate();

  // Chat states
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messageIds = useRef(new Set());
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatHistory = async () => {
    setIsChatLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/chat/history", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${
            user?.token || localStorage.getItem("token") || ""
          }`,
        },
      });
      const uniqueMessages = response.data
        .filter(
          (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index
        )
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      messageIds.current.clear();
      uniqueMessages.forEach((msg) => messageIds.current.add(msg.id));
      setMessages(uniqueMessages);
      setChatError(null);
    } catch (error) {
      console.error(
        "Error fetching chat history:",
        error.response?.status,
        error.message
      );
      setChatError("Failed to load chat history");
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      const fetchUserAndActivity = async () => {
        try {
          console.log("Fetching user data for ID:", user.id);
          const userResponse = await axios.get(
            `http://localhost:8080/users/${user.id}`,
            {
              withCredentials: true,
            }
          );
          console.log("User data fetched:", userResponse.data);
          setDbUser(userResponse.data);

          console.log("Fetching posts from /api/posts/all");
          const postsResponse = await axios.get(
            "http://localhost:8080/api/posts/all",
            {
              withCredentials: true,
            }
          );
          console.log("Posts fetched:", postsResponse.data);

          const userPosts = postsResponse.data
            .filter((post) => post.userId === user.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          console.log("Filtered and sorted user posts:", userPosts);
          setPosts(userPosts);

          try {
            const followersResponse = await axios.get(
              `http://localhost:8080/users/${user.id}/followers`,
              {
                withCredentials: true,
              }
            );
            console.log("Followers fetched:", followersResponse.data);
            setFollowers(followersResponse.data || []);
          } catch (followersErr) {
            console.error("Error fetching followers:", followersErr);
            setFollowers([]);
          }

          try {
            const followingResponse = await axios.get(
              `http://localhost:8080/users/me/following`,
              {
                withCredentials: true,
              }
            );
            console.log("Following fetched:", followingResponse.data);
            setFollowing(followingResponse.data || []);
          } catch (followingErr) {
            console.error("Error fetching following:", followingErr);
            setFollowing([]);
          }

          setLoading(false);
        } catch (err) {
          console.error("Error fetching data:", err.response || err.message);
          setError(
            "Failed to load profile or posts. Please check your connection or login status."
          );
          setLoading(false);
        }
      };
      fetchUserAndActivity();
    } else {
      console.log("No user or user.id found, setting loading to false");
      setError("Please log in to view your profile.");
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isChatOpen && user) {
      setMessages([]);
      messageIds.current.clear();
      setChatError(null);
      setConnectionStatus("connecting");
      fetchChatHistory();

      const socket = new SockJS("http://localhost:8080/chat-websocket");
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        connectHeaders: {
          Authorization: `Bearer ${
            user?.token || localStorage.getItem("token") || ""
          }`,
        },
        debug: (str) => {
          console.log("STOMP: " + str);
        },
      });

      client.onConnect = (frame) => {
        console.log("Connected: " + frame);
        setConnectionStatus("connected");
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
        subscriptionRef.current = client.subscribe(
          "/topic/groupchat",
          (message) => {
            try {
              const newMessage = JSON.parse(message.body);
              if (newMessage.content === "[DELETED]") {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === newMessage.id
                      ? {
                          ...msg,
                          content: "[DELETED]",
                          timestamp: newMessage.timestamp,
                        }
                      : msg
                  )
                );
              } else if (messageIds.current.has(newMessage.id)) {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === newMessage.id ? newMessage : msg
                  )
                );
              } else {
                messageIds.current.add(newMessage.id);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
              }
            } catch (error) {
              console.error("Error parsing message:", error);
              setChatError("Error receiving message");
            }
          }
        );
        messageInputRef.current?.focus();
      };

      client.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        setChatError("Connection error");
        setConnectionStatus("error");
      };

      client.onWebSocketError = (error) => {
        console.error("WebSocket error:", error);
        setChatError("WebSocket connection error");
        setConnectionStatus("error");
      };

      client.onWebSocketClose = (event) => {
        console.log("WebSocket closed:", event);
        subscriptionRef.current = null;
        setChatError("WebSocket connection closed");
        setConnectionStatus("disconnected");
      };

      client.activate();
      setStompClient(client);

      return () => {
        if (client && client.connected) {
          if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          }
          client.deactivate();
        }
        setMessages([]);
        messageIds.current.clear();
        setChatError(null);
      };
    }
  }, [isChatOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      console.log("Logging out user");
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleMessage = (userId, userName) => {
    console.log(`Message button clicked for user ID: ${userId}`);
    navigate(`/chat/${userId}`, { state: { name: userName } });
  };

  const sendMessage = (e) => {
    e?.preventDefault();

    if (messageInput.trim() && stompClient && stompClient.connected) {
      if (editingMessageId) {
        stompClient.publish({
          destination: "/app/updateMessage",
          body: JSON.stringify({
            messageId: editingMessageId,
            content: messageInput,
          }),
        });
        setEditingMessageId(null);
      } else {
        stompClient.publish({
          destination: "/app/sendMessage",
          body: JSON.stringify(messageInput),
        });
      }
      setMessageInput("");
      messageInputRef.current?.focus();
    } else if (!stompClient?.connected) {
      setChatError("Cannot send message: Not connected");
    }
  };

  const editMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setMessageInput(content);
    messageInputRef.current?.focus();
  };

  const deleteMessage = (messageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (confirmDelete && stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/deleteMessage",
        body: messageId,
      });
    } else if (!stompClient?.connected) {
      setChatError("Cannot delete message: Not connected");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape" && editingMessageId) {
      setEditingMessageId(null);
      setMessageInput("");
    }
  };

  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentMessages = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.timestamp).toLocaleDateString();
      if (messageDate !== currentDate) {
        if (currentMessages.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentMessages,
          });
        }
        currentDate = messageDate;
        currentMessages = [message];
      } else {
        currentMessages.push(message);
      }
    });

    if (currentMessages.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentMessages,
      });
    }

    return groups;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isCurrentUser = (senderId) => {
    return senderId === user?.id;
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

 const renderActivityContent = () => {
  switch (activeTab) {
    case "posts":
      return (
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-gray-800 font-medium mb-2">No posts yet</h3>
              <p className="text-gray-500 text-sm text-center mb-4 max-w-xs">
                Share your favorite recipes, cooking tips or food adventures with the community.
              </p>
              <Link
                to="/createpost"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Your First Post
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mr-3 text-blue-600 font-bold">
                      {dbUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-medium leading-tight">
                        {dbUser.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(post.timestamp).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {post.location && (
                          <span className="ml-2 inline-flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-1"
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
                      </p>
                    </div>
                  </div>
                  
                  {/* Post topic header with recipe tag */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {post.topic}
                      </h2>
                      <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        Recipe
                      </span>
                    </div>
                  </div>
                  
                  {/* Post description with expandable text */}
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                </div>

                {/* Media gallery */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className={`border-t border-gray-100 ${post.mediaUrls.length === 1 ? "" : "grid grid-cols-2 gap-1"}`}>
                    {post.mediaUrls.length === 1 ? (
                      <div className="aspect-video w-full">
                        <img
                          src={post.mediaUrls[0]}
                          alt={`${post.topic} - media`}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                        />
                      </div>
                    ) : (
                      post.mediaUrls.slice(0, 4).map((url, index) => (
                        <div 
                          key={index}
                          className={`relative aspect-square ${post.mediaUrls.length > 4 && index === 3 ? "overflow-hidden" : ""}`}
                        >
                          <img
                            src={url}
                            alt={`${post.topic} - media ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                          />
                          {post.mediaUrls.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                              <span className="text-white font-medium text-lg">
                                +{post.mediaUrls.length - 4} more
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Post footer with actions */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-1.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                      Like
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-1.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                        />
                      </svg>
                      Comment
                    </button>
                  </div>
                  <div>
                    <button className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 mr-1.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                        />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    case "followers":
      return (
        <div className="py-2">
          {followers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-500 text-center font-medium mb-2">
                No followers yet
              </p>
              <p className="text-gray-400 text-center text-sm max-w-xs">
                Your followers will appear here once people start following
                your profile.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {followers.map((follower) => (
                <li
                  key={follower.id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={
                            follower.picture ||
                            "https://via.placeholder.com/40"
                          }
                          alt={`${follower.name}'s avatar`}
                          className="h-full w-full object-cover"
                          onError={(e) =>
                            (e.target.src = "/placeholder-image.jpg")
                          }
                        />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium">
                          {follower.name}
                        </h3>
                        <p className="text-gray-500 text-sm">Follower</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleMessage(follower.id, follower.name)
                        }
                        className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition duration-150 text-sm"
                      >
                        message
                      </button>
                      <Link
                        to={`/frendsprofile/${follower.id}`}
                        className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition duration-150 text-sm"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    case "following":
      return (
        <div className="py-2">
          {following.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-500 text-center font-medium mb-2">
                You're not following anyone yet
              </p>
              <p className="text-gray-400 text-center text-sm max-w-xs">
                When you follow someone, they'll appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {following.map((person) => (
                <li
                  key={person.id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={
                            person.picture || "https://via.placeholder.com/40"
                          }
                          alt={`${person.name}'s profile`}
                          className="h-full w-full object-cover"
                          onError={(e) =>
                            (e.target.src = "/placeholder-image.jpg")
                          }
                        />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-medium">
                          {person.name}
                        </h3>
                        <p className="text-gray-500 text-sm">Following</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMessage(person.id, person.name)}
                        className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition duration-150 text-sm"
                      >
                        message
                      </button>
                      <Link
                        to={`/frendsprofile/${person.id}`}
                        className="text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition duration-150 text-sm"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    default:
      return null;
  }
};


  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-500 font-medium">{error}</p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <p className="text-lg text-gray-700 mb-4">
            Please login to view this page
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="flex justify-center md:justify-start">
              {dbUser.picture ? (
                <img
                  src={dbUser.picture}
                  alt="Profile"
                  className="h-40 w-40 rounded-full object-cover border-4 border-blue-100 shadow-sm"
                  onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-sm">
                  {dbUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {dbUser.name}
              </h1>
              <p className="text-gray-600 text-sm mt-1">{dbUser.email}</p>
              <p className="text-gray-600 text-sm mt-1">
                Birthday:{" "}
                {dbUser.birthday
                  ? new Date(dbUser.birthday).toLocaleDateString()
                  : "Not provided"}
              </p>
              {dbUser.about && (
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">
                  {dbUser.about}
                </p>
              )}
              <div className="mt-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {dbUser.provider
                    ? dbUser.provider.charAt(0).toUpperCase() +
                      dbUser.provider.slice(1)
                    : "Cook App"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-base font-medium text-gray-800 mb-3">
              Activity Snapshot
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow hover:border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                        clipRule="evenodd"
                      />
                      <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Posts</p>
                    <div className="flex items-end">
                      <p className="text-lg font-bold text-gray-800">
                        {posts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow hover:border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Followers
                    </p>
                    <div className="flex items-end">
                      <p className="text-lg font-bold text-gray-800">
                        {followers.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow hover:border-blue-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">
                      Following
                    </p>
                    <div className="flex items-end">
                      <p className="text-lg font-bold text-gray-800">
                        {following.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                Group Chat
              </button>
              <Link
                to="/createpost"
                className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Post
              </Link>
              <Link
                to={`/editprofile/${user.id}`}
                className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 transition-colors ml-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === "posts"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("posts")}
            >
              Posts ({posts.length})
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === "followers"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("followers")}
            >
              Followers ({followers.length})
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium text-center ${
                activeTab === "following"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following ({following.length})
            </button>
          </div>
          <div className="p-4">{renderActivityContent()}</div>
          {activeTab === "posts" && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link
                to="/createpost"
                className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Post
              </Link>
            </div>
          )}
          {activeTab === "followers" && followers.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link
                to="/allusers"
                className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Find More People
              </Link>
            </div>
          )}
          {activeTab === "following" && following.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <Link
                to="/allusers"
                className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Find More People to Follow
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-white">
                CookBook Community Chat
              </h1>
              <div className="flex items-center mt-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-purple-300"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-400"
                      : "bg-red-500"
                  } mr-2`}
                ></span>
                <p className="text-purple-100 text-xs">
                  {connectionStatus === "connected"
                    ? "Online"
                    : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:text-purple-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {chatError && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p>{chatError}</p>
              </div>
              <button
                onClick={fetchChatHistory}
                className="flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Retry</span>
              </button>
            </div>
          )}

          {isChatLoading && (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading messages...</p>
              </div>
            </div>
          )}

          {!isChatLoading && (
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-6"
            >
              {messages.length === 0 && !chatError && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-purple-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )}

              {groupMessagesByDate().map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                      {new Date(group.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  {group.messages.map((msg, index) => {
                    const isFromCurrentUser = isCurrentUser(msg.senderId);

                    return (
                      <div
                        key={`${msg.id}-${index}`}
                        className={`flex ${
                          isFromCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isFromCurrentUser && (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-purple-700 font-medium text-sm">
                              {getInitial(msg.senderName)}
                            </span>
                          </div>
                        )}

                        <div className="max-w-[70%] space-y-1">
                          {!isFromCurrentUser && (
                            <span className="text-xs text-gray-500 ml-1">
                              {msg.senderName}
                            </span>
                          )}

                          <div className="relative group">
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                isFromCurrentUser
                                  ? "bg-purple-600 text-white rounded-br-none"
                                  : "bg-purple-100 text-purple-900 rounded-bl-none"
                              } ${
                                msg.content === "[DELETED]"
                                  ? "opacity-50 italic"
                                  : ""
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                            </div>
                            {isFromCurrentUser &&
                              msg.content !== "[DELETED]" && (
                                <div className="absolute right-0 top-0 mt-2 mr-2 hidden group-hover:block">
                                  <button
                                    onClick={() =>
                                      editMessage(msg.id, msg.content)
                                    }
                                    className="p-1 bg-purple-100 hover:bg-purple-200 rounded-full mr-1"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-purple-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.414H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="p-1 bg-red-100 hover:bg-red-200 rounded-full"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-red-600"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 4v12m4-12v12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )}
                          </div>

                          <div
                            className={`text-xs text-gray-400 ${
                              isFromCurrentUser ? "text-right mr-1" : "ml-1"
                            }`}
                          >
                            {formatMessageTime(msg.timestamp)}
                          </div>
                        </div>

                        {isFromCurrentUser && (
                          <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center ml-2 flex-shrink-0">
                            <span className="text-white font-medium text-sm">
                              {getInitial(user.name)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-white">
            <form
              onSubmit={sendMessage}
              className="flex items-center space-x-3"
            >
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  editingMessageId
                    ? "Editing message..."
                    : "Type your message..."
                }
                className="flex-1 p-3 bg-purple-50 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-purple-300 transition-all duration-300"
                disabled={connectionStatus !== "connected"}
              />
              <button
                type="submit"
                disabled={
                  !messageInput.trim() || connectionStatus !== "connected"
                }
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
              {editingMessageId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessageId(null);
                    setMessageInput("");
                  }}
                  className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </form>
            {connectionStatus !== "connected" && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {connectionStatus === "connecting"
                  ? "Connecting to chat..."
                  : "Disconnected. Please refresh the page."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;