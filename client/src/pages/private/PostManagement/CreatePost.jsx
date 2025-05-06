import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];

const CreatePost = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState({
    userId: '',
    topic: '',
    description: '',
    mediaUrls: [],
    mediaTypes: [],
    isPrivate: false,
    taggedFriends: [],
    location: '',
    timestamp: '',
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');

  const topicWordCount = post.topic.trim().split(/\s+/).filter(Boolean).length;
  const descriptionWordCount = post.description.trim().split(/\s+/).filter(Boolean).length;
  const isFormValid =
    user?.id && post.topic && topicWordCount <= 20 && post.description && descriptionWordCount <= 50;

  useEffect(() => {
    if (!user?.id) {
      toast.error('User not logged in. Please log in to create a post.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    const timestamp = new Date().toISOString();
    setPost((prev) => ({ ...prev, userId: user.id, timestamp }));
    detectLocation();
  }, [navigate, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost({ ...post, [name]: type === 'checkbox' ? checked : value });
  };

  const startListening = () => {
    if (!SpeechRecognition) return toast.error('Speech recognition not supported.');
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      const words = transcript.trim().split(/\s+/);
      if (words.length > 50) {
        recognition.stop();
        toast.error('Speech input exceeds 50 words.');
      } else {
        setPost((prev) => ({ ...prev, description: transcript }));
      }
    };

    recognition.onerror = (event) => {
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    window.recognitionInstance = recognition;
  };

  const stopListening = () => {
    if (window.recognitionInstance) {
      window.recognitionInstance.stop();
      setIsListening(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setPost((prev) => ({
            ...prev,
            location: data.display_name || `${latitude}, ${longitude}`,
          }));
        } catch {
          toast.error('Could not fetch location.');
        }
      },
      () => toast.error('Location access denied.')
    );
  };

  const handleFileSelect = (e) => {
    handleFileValidation(Array.from(e.target.files));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFileValidation(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileValidation = (files) => {
    if (mediaFiles.length + files.length > MAX_FILES)
      return toast.error(`Maximum ${MAX_FILES} files allowed.`);

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File type not allowed: ${file.name}`);
        return;
      }

      if (
        (file.type.startsWith('video') && file.size > MAX_VIDEO_SIZE) ||
        (!file.type.startsWith('video') && file.size > MAX_IMAGE_SIZE)
      ) {
        toast.error(`File too large: ${file.name}`);
        return;
      }

      setMediaFiles((prev) => [...prev, { file, url: URL.createObjectURL(file) }]);
    });
  };

  const handleRemoveFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < mediaFiles.length) {
      const updated = [...mediaFiles];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      setMediaFiles(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mediaUrls = [];
      const mediaTypes = [];

      for (let media of mediaFiles) {
        const formData = new FormData();
        formData.append('file', media.file);

        const res = await axios.post('http://localhost:8080/api/posts/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
          withCredentials: true,
        });

        mediaUrls.push(res.data);
        mediaTypes.push(media.file.type.startsWith('video') ? 'video' : 'image');
      }

      const newPost = { ...post, mediaUrls, mediaTypes };

      await axios.post('http://localhost:8080/api/posts/create', newPost, {
        withCredentials: true,
      });

      toast.success('Post created successfully!');
      setTimeout(() => navigate('/postfeed'), 1500);
    } catch (err) {
      toast.error(`Failed to create post: ${err.response?.data || err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Topic</label>
          <textarea
            name="topic"
            value={post.topic}
            onChange={handleInputChange}
            placeholder="Post topic (max 20 words)"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 text-right">{topicWordCount}/20 words</p>
        </div>

        <div className="relative">
          <label className="block mb-1 font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={post.description}
            onChange={handleInputChange}
            placeholder="Description (max 50 words)"
            className="w-full p-3 border rounded-lg pr-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 text-right">{descriptionWordCount}/50 words</p>
          <div className="absolute right-3 top-12 flex items-center space-x-2">
            <button
              type="button"
              onClick={startListening}
              disabled={isListening}
              className={`text-sm px-3 py-1 rounded-lg ${
                isListening ? 'bg-gray-300 text-gray-600' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              🎤 Speak
            </button>
            <button
              type="button"
              onClick={stopListening}
              disabled={!isListening}
              className={`text-sm px-3 py-1 rounded-lg ${
                !isListening ? 'bg-gray-300 text-gray-600' : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              🛑 Stop
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-white border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en-US">English</option>
              <option value="si-LK">Sinhala</option>
              <option value="ta-IN">Tamil</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <input
            name="location"
            value={post.location}
            onChange={handleInputChange}
            placeholder="Enter or auto-detect location"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={detectLocation}
            className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
          >
            📍
          </button>
        </div>

        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          className="w-full p-6 border-2 border-dashed border-blue-400 rounded-lg text-center text-gray-600 hover:bg-gray-50"
        >
          Drag and drop images/videos here, or click below
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.mp4"
            onChange={handleFileSelect}
            className="w-full mt-3"
          />
        </div>

        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {mediaFiles.map((p, i) => (
              <div key={i} className="relative border p-2 rounded-lg group">
                <button
                  type="button"
                  onClick={() => handleRemoveFile(i)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ❌
                </button>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, -1)}
                    className="absolute left-2 top-2 bg-blue-500 text-white p-1 text-xs"
                  >
                    ⬆️
                  </button>
                )}
                {i < mediaFiles.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, 1)}
                    className="absolute left-2 bottom-2 bg-blue-500 text-white p-1 text-xs"
                  >
                    ⬇️
                  </button>
                )}
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
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isPrivate"
            checked={post.isPrivate}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-700">Private</span>
        </label>

        <input
          type="text"
          name="taggedFriends"
          placeholder="Tagged friends (comma separated)"
          onChange={(e) =>
            setPost({ ...post, taggedFriends: e.target.value.split(',').map((f) => f.trim()) })
          }
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            isFormValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
          } transition`}
        >
          Create Post
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default CreatePost;