import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messageIds = useRef(new Set());
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history
  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/chat/history', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${user?.token || localStorage.getItem('token') || ''}`,
        },
      });
      // Deduplicate and sort by timestamp ascending
      const uniqueMessages = response.data
        .filter((msg, index, self) => self.findIndex((m) => m.id === msg.id) === index)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      messageIds.current.clear();
      uniqueMessages.forEach((msg) => messageIds.current.add(msg.id));
      setMessages(uniqueMessages);
      setError(null);
    } catch (error) {
      console.error('Error fetching chat history:', error.response?.status, error.message);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Reset state
    setMessages([]);
    messageIds.current.clear();
    setError(null);
    setConnectionStatus('connecting');

    // Fetch history
    fetchChatHistory();

    // Initialize WebSocket
    const socket = new SockJS('http://localhost:8080/chat-websocket');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${user?.token || localStorage.getItem('token') || ''}`,
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
    });

    client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      setConnectionStatus('connected');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      subscriptionRef.current = client.subscribe('/topic/groupchat', (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          if (messageIds.current.has(newMessage.id)) {
            return;
          }
          messageIds.current.add(newMessage.id);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } catch (error) {
          console.error('Error parsing message:', error);
          setError('Error receiving message');
        }
      });
      
      // Focus on input field after connection
      messageInputRef.current?.focus();
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      setError('Connection error');
      setConnectionStatus('error');
    };

    client.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setConnectionStatus('error');
    };

    client.onWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
      subscriptionRef.current = null;
      setError('WebSocket connection closed');
      setConnectionStatus('disconnected');
    };

    client.activate();
    setStompClient(client);

    // Cleanup
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
      setError(null);
    };
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e?.preventDefault();
    
    if (messageInput.trim() && stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify(messageInput),
      });
      setMessageInput('');
      
      // Focus back on input after sending
      messageInputRef.current?.focus();
    } else if (!stompClient?.connected) {
      setError('Cannot send message: Not connected');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
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
            messages: currentMessages
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
        messages: currentMessages
      });
    }

    return groups;
  };

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isCurrentUser = (senderId) => {
    return senderId === user?.id;
  };

  // Get avatar initial
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">Please login to join the chat</p>
          </div>
          <Link 
            to="/login" 
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">CookBook Community Chat</h1>
              <div className="flex items-center mt-1">
                <span className={`h-2 w-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-500'
                } mr-2`}></span>
                <p className="text-indigo-100 text-sm">
                  {connectionStatus === 'connected' ? 'Online' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
              <span className="text-white text-sm font-medium">{user.name}</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
            <button
              onClick={fetchChatHistory}
              className="flex items-center px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading messages...</p>
            </div>
          </div>
        )}

        {/* Message container */}
        {!isLoading && (
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
          >
            {messages.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                </div>
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            )}

            {groupMessagesByDate().map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                    {new Date(group.date).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {group.messages.map((msg, index) => {
                  const isFromCurrentUser = isCurrentUser(msg.senderId);
                  
                  return (
                    <div
                      key={`${msg.id}-${index}`}
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isFromCurrentUser && (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <span className="text-indigo-600 font-medium text-sm">{getInitial(msg.senderName)}</span>
                        </div>
                      )}
                      
                      <div className="max-w-xs sm:max-w-md space-y-1">
                        {!isFromCurrentUser && (
                          <span className="text-xs text-gray-500 ml-1">{msg.senderName}</span>
                        )}
                        
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isFromCurrentUser
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        
                        <div className={`text-xs text-gray-400 ${isFromCurrentUser ? 'text-right mr-1' : 'ml-1'}`}>
                          {formatMessageTime(msg.timestamp)}
                        </div>
                      </div>
                      
                      {isFromCurrentUser && (
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center ml-2 flex-shrink-0">
                          <span className="text-white font-medium text-sm">{getInitial(user.name)}</span>
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

        {/* Message input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={sendMessage} className="flex items-center space-x-3">
            <input
              ref={messageInputRef}
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-300 transition-all duration-300"
              disabled={connectionStatus !== 'connected'}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || connectionStatus !== 'connected'}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          {connectionStatus !== 'connected' && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              {connectionStatus === 'connecting' ? 'Connecting to chat...' : 'Disconnected. Please refresh the page.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;