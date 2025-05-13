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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messageIds = useRef(new Set());
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/chat/history', {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${user?.token || localStorage.getItem('token') || ''}`,
        },
      });
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

    setMessages([]);
    messageIds.current.clear();
    setError(null);
    setConnectionStatus('connecting');

    fetchChatHistory();

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
          if (newMessage.content === '[DELETED]') {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === newMessage.id
                  ? { ...msg, content: '[DELETED]', timestamp: newMessage.timestamp }
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
          console.error('Error parsing message:', error);
          setError('Error receiving message');
        }
      });
      
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
      if (editingMessageId) {
        stompClient.publish({
          destination: '/app/updateMessage',
          body: JSON.stringify({
            messageId: editingMessageId,
            content: messageInput
          }),
        });
        setEditingMessageId(null);
      } else {
        stompClient.publish({
          destination: '/app/sendMessage',
          body: JSON.stringify(messageInput),
        });
      }
      setMessageInput('');
      messageInputRef.current?.focus();
    } else if (!stompClient?.connected) {
      setError('Cannot send message: Not connected');
    }
  };

  const editMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setMessageInput(content);
    messageInputRef.current?.focus();
  };

  const deleteMessage = (messageId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this message?');
    if (confirmDelete && stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/deleteMessage',
        body: messageId,
      });
    } else if (!stompClient?.connected) {
      setError('Cannot delete message: Not connected');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape' && editingMessageId) {
      setEditingMessageId(null);
      setMessageInput('');
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

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId) => {
    return senderId === user?.id;
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white border border-purple-100 p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-semibold text-gray-900">Please login to join the chat</p>
          </div>
          <Link 
            to="/login" 
            className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CookBook Community Chat</h1>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Profile
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-8rem)] border border-purple-100">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`h-2 w-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-500'
                } mr-2`}></span>
                <p className="text-sm text-gray-500">
                  {connectionStatus === 'connected' ? 'Online' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </p>
              </div>
              <div className="flex items-center bg-purple-100 rounded-full px-3 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-purple-800">{user.name}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
              </div>
              <button
                onClick={fetchChatHistory}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading messages...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
            >
              {messages.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              )}

              {groupMessagesByDate().map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="mx-4 bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                      {new Date(group.date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {group.messages.map((msg, index) => {
                    const isFromCurrentUser = isCurrentUser(msg.senderId);
                    
                    return (
                      <div
                        key={`${msg.id}-${index}`}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isFromCurrentUser && (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 flex-shrink-0 border border-purple-100">
                            <span className="text-purple-600 font-medium text-sm">{getInitial(msg.senderName)}</span>
                          </div>
                        )}
                        
                        <div className="max-w-xs sm:max-w-md space-y-1">
                          {!isFromCurrentUser && (
                            <span className="text-xs text-gray-500 ml-1">{msg.senderName}</span>
                          )}
                          
                          <div className="relative group">
                            <div
                              className={`px-4 py-3 rounded-lg shadow-sm ${
                                isFromCurrentUser
                                  ? 'bg-purple-600 text-white rounded-br-none'
                                  : 'bg-purple-100 text-purple-800 rounded-bl-none'
                              } ${msg.content === '[DELETED]' ? 'opacity-50 italic' : ''}`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                            {isFromCurrentUser && msg.content !== '[DELETED]' && (
                              <div className="absolute right-0 top-0 mt-2 mr-2 hidden group-hover:block">
                                <button
                                  onClick={() => editMessage(msg.id, msg.content)}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full mr-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.414H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 4v12m4-12v12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className={`text-xs text-gray-400 ${isFromCurrentUser ? 'text-right mr-1' : 'ml-1'}`}>
                            {formatMessageTime(msg.timestamp)}
                          </div>
                        </div>
                        
                        {isFromCurrentUser && (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center ml-2 flex-shrink-0 border border-purple-100">
                            <span className="text-purple-600 font-medium text-sm">{getInitial(user.name)}</span>
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
            <form onSubmit={sendMessage} className="flex items-center space-x-3">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={editingMessageId ? 'Editing message...' : 'Type your message...'}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent shadow-sm transition-colors duration-200 disabled:bg-gray-100"
                disabled={connectionStatus !== 'connected'}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || connectionStatus !== 'connected'}
                className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
              {editingMessageId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessageId(null);
                    setMessageInput('');
                  }}
                  className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors duration-200 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
            {connectionStatus !== 'connected' && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {connectionStatus === 'connecting' ? 'Connecting to chat...' : 'Disconnected. Please refresh the page.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;