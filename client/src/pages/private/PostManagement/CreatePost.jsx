// ✅ CreatePost.jsx with Debugging + withCredentials + CORS fix alignment

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];

const CreatePost = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const navigate = useNavigate();

  const [post, setPost] = useState({
    userId: '',
    topic: '',
    description: '',
    mediaUrls: [],
    mediaTypes: [],
    isPrivate: false,
    taggedFriends: [],
    location: '',
    timestamp: ''
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const topicWordCount = post.topic.trim().split(/\s+/).filter(Boolean).length;
  const descriptionWordCount = post.description.trim().split(/\s+/).filter(Boolean).length;

  const isFormValid = post.topic && topicWordCount <= 20 && post.description && descriptionWordCount <= 50;

  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'user123';
    const timestamp = new Date().toISOString();
    setPost(prev => ({ ...prev, userId, timestamp }));
    detectLocation();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'topic' && value.trim().split(/\s+/).length > 20) return;
    if (name === 'description' && value.trim().split(/\s+/).length > 50) return;
    setPost({ ...post, [name]: type === 'checkbox' ? checked : value });
  };

  const startListening = () => {
    if (!SpeechRecognition) return toast.error('Speech recognition not supported.');
    if (isListening) return toast.info('Already listening...');

    const recognition = new SpeechRecognition();
    window.SpeechRecognitionInstance = recognition;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
      const words = transcript.trim().split(/\s+/);
      if (words.length > 50) return toast.error('Speech input exceeds 50 words.');
      setPost(prev => ({ ...prev, description: transcript }));
    };
    recognition.onerror = (event) => {
      toast.error(`Speech error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
  };

  const stopListening = () => {
    if (window.SpeechRecognitionInstance) {
      window.SpeechRecognitionInstance.stop();
      setIsListening(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setPost(prev => ({ ...prev, location: data.display_name || `${latitude}, ${longitude}` }));
        } catch {
          toast.error("Could not fetch location.");
        }
      },
      () => toast.error("Location access denied.")
    );
  };

  const handleFileSelect = (e) => handleFileValidation(Array.from(e.target.files));
  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFileValidation(Array.from(e.dataTransfer.files));
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleFileValidation = (files) => {
    if (mediaFiles.length >= MAX_FILES) return toast.error(`Only ${MAX_FILES} files allowed.`);
    files.forEach(file => {
      if (mediaFiles.length >= MAX_FILES) return;
      if (!ALLOWED_TYPES.includes(file.type)) return toast.error(`Not allowed: ${file.name}`);
      if ((file.type.startsWith('video') && file.size > MAX_VIDEO_SIZE) || (!file.type.startsWith('video') && file.size > MAX_IMAGE_SIZE)) {
        return toast.error(`File too large: ${file.name}`);
      }
      setMediaFiles(prev => [...prev, { file, url: URL.createObjectURL(file) }]);
    });
  };

  const handleRemoveFile = (index) => setMediaFiles(prev => prev.filter((_, i) => i !== index));
  const moveFile = (i, d) => {
    const files = [...mediaFiles];
    const j = i + d;
    if (j >= 0 && j < files.length) {
      [files[i], files[j]] = [files[j], files[i]];
      setMediaFiles(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mediaUrls = [], mediaTypes = [];
      for (let m of mediaFiles) {
        const formData = new FormData();
        formData.append('file', m.file);
        const res = await axios.post('http://localhost:8080/api/posts/upload', formData, {
          onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
          withCredentials: true
        });
        mediaUrls.push(res.data);
        mediaTypes.push(m.file.type.startsWith('video') ? 'video' : 'image');
      }
      const newPost = { ...post, mediaUrls, mediaTypes };
      await axios.post('http://localhost:8080/api/posts/create', newPost, {
        withCredentials: true
      });
      toast.success('Post created!');
      setTimeout(() => navigate('/postfeed'), 1500);
    } catch (err) {
      console.error("❌ Error submitting post:", err);
      toast.error('Submit failed.');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea name="topic" value={post.topic} onChange={handleInputChange} placeholder="Post topic (max 20 words)" className="w-full p-2 border rounded" />
          <p className="text-sm text-right">{topicWordCount}/20 words</p>
        </div>

        <div className="relative">
          <label className="block font-semibold mb-1">Description</label>
          <textarea name="description" value={post.description} onChange={handleInputChange} placeholder="Description (max 50 words)" className="w-full p-2 border rounded pr-16" />
          <p className="text-sm text-right">{descriptionWordCount}/50 words</p>
          <div className="absolute right-2 top-2 flex items-center space-x-2">
            <button type="button" onClick={startListening} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded">
              🎤 {isListening ? 'Listening...' : 'Speak'}
            </button>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="text-xs bg-white border rounded px-1 py-0.5">
              <option value="en-US">English</option>
              <option value="si-LK">Sinhala</option>
              <option value="ta-IN">Tamil</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <input type="text" name="location" placeholder="Location will auto-fill..." value={post.location} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <button type="button" onClick={detectLocation} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">📍</button>
        </div>

        <div onDrop={handleFileDrop} onDragOver={handleDragOver} className="w-full p-4 border-2 border-dashed border-blue-400 rounded text-center text-gray-600">
          Drag and drop images/videos here, or click below
          <input type="file" multiple accept=".jpg,.jpeg,.png,.mp4" onChange={handleFileSelect} className="w-full mt-2" />
        </div>

        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {mediaFiles.map((p, i) => (
              <div key={i} className="relative border p-1 rounded group">
                <button type="button" onClick={() => handleRemoveFile(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">❌</button>
                {i > 0 && <button type="button" onClick={() => moveFile(i, -1)} className="absolute left-1 top-1 bg-blue-500 text-white p-1 text-xs rounded">⬆️</button>}
                {i < mediaFiles.length - 1 && <button type="button" onClick={() => moveFile(i, 1)} className="absolute left-1 bottom-1 bg-blue-500 text-white p-1 text-xs rounded">⬇️</button>}
                {p.file.type.startsWith('video') ? (
                  <video src={p.url} controls className="w-full max-h-40 object-cover rounded" />
                ) : (
                  <img src={p.url} alt="Preview" className="w-full max-h-40 object-cover rounded" />
                )}
              </div>
            ))}
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 h-2 rounded">
            <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isPrivate" onChange={handleInputChange} />
          <span>Private</span>
        </label>

        <input type="text" name="taggedFriends" placeholder="Tagged friends (comma separated)" onChange={(e) => setPost({ ...post, taggedFriends: e.target.value.split(',') })} className="w-full p-2 border rounded" />

        <button type="submit" disabled={!isFormValid} className={`px-4 py-2 rounded text-white ${isFormValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}>Post</button>
      </form>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default CreatePost;
