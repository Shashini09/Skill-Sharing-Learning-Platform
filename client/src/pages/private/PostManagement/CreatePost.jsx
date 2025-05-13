import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';
import { storage } from '../../../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { debounce } from 'lodash';

const CreatePost = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [post, setPost] = useState({
    userId: '',
    topic: '',
    description: '',
    category: 'general',
    mediaUrls: [],
    mediaTypes: [],
    location: '',
    timestamp: ''
  });

  const permittedMediaTypes = ['image/png', 'image/jpeg', 'video/mp4'];
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Keyword-to-category mapping
  const categoryKeywords = {
    'baking': ['bread', 'cake', 'cookie', 'muffin', 'pastry', 'pie', 'scone', 'bake', 'oven', 'dough'],
    'desserts': ['ice cream', 'pudding', 'chocolate', 'custard', 'tart', 'brownie', 'dessert', 'sweet', 'candy'],
    'vegan': ['vegan', 'plant-based', 'tofu', 'lentil', 'chickpea', 'quinoa', 'avocado', 'kale'],
    'vegetarian': ['vegetarian', 'veggie', 'salad', 'mushroom', 'spinach', 'eggplant', 'zucchini'],
    'grilling': ['grill', 'barbecue', 'bbq', 'steak', 'ribs', 'skewers', 'smoked', 'charcoal'],
    'Italian': ['pasta', 'pizza', 'lasagna', 'risotto', 'tiramisu', 'spaghetti', 'pesto', 'marinara'],
    'Indian': ['curry', 'biryani', 'naan', 'tikka', 'masala', 'dal', 'samosa', 'chutney'],
    'Mexican': ['taco', 'burrito', 'enchilada', 'salsa', 'guacamole', 'quesadilla', 'chili'],
    'Asian': ['sushi', 'ramen', 'stir-fry', 'dumpling', 'pho', 'kimchi', 'teriyaki', 'noodle'],
    'healthy eating': ['smoothie', 'quinoa', 'salad', 'low-carb', 'gluten-free', 'keto', 'organic'],
    'meal prep': ['batch', 'prepping', 'freezer', 'lunchbox', 'meal plan', 'make-ahead'],
    'cooking tips': ['knife skills', 'seasoning', 'sous-vide', 'braising', 'technique', 'recipe hack'],
    'breakfast': ['pancake', 'omelette', 'waffle', 'smoothie', 'granola', 'yogurt', 'egg'],
    'dinner': ['roast', 'casserole', 'stew', 'soup', 'dinner', 'main course', 'entree'],
    'snacks': ['chips', 'dip', 'popcorn', 'trail mix', 'nachos', 'pretzel', 'snack'],
    'beverages': ['cocktail', 'smoothie', 'juice', 'tea', 'coffee', 'mocktail', 'lemonade'],
    'lifestyle': ['foodie', 'cooking show', 'kitchen', 'gourmet', 'culinary', 'dining'],
    'general': []
  };
const categoryKeywords = {
  'fast food': [
    'burger', 'pizza', 'fries', 'taco', 'sandwich', 'nuggets', 'hotdog', 'fried chicken', 'wrap', 'fastfood', 
    'hamburger', 'cheeseburger', 'burrito',
    'sliders', 'quesadilla', 'onion rings', 'milkshake', 'drive-thru', 'takeout', 'hambuger', 'chicken strips', 
    'sub', 'gyro', 'kebab'
  ],
  'healthy foods': [
    'salad', 'quinoa', 'kale', 'avocado', 'smoothie', 'chia', 'oats', 'whole grain', 'low-fat', 'superfood', 
    'spinach', 'broccoli', 'almond',
    'flaxseed', 'turmeric', 'ginger', 'edamame', 'lentils', 'barley', 'tofu', 'arugula', 'cauliflower', 
    'sweet potato', 'blueberries'
  ],
  'desserts': [
    'ice cream', 'pudding', 'chocolate', 'custard', 'tart', 'brownie', 'dessert', 'sweet', 'candy', 'sorbet', 
    'cheesecake', 'macaron', 'cookie', 'cake',
    'donut', 'pie', 'mousse', 'trifle', 'fudge', 'gelato', 'pastry', 'cupcake', 'eclair', 'churros', 'baklava'
  ],
  'juice': [
    'juice', 'green juice', 'smoothie', 'detox', 'fruit juice', 'vegetable juice', 'cold-pressed', 'lemonade', 
    'blend', 'orange juice', 'apple juice',
    'carrot juice', 'beet juice', 'pineapple juice', 'cranberry juice', 'kombucha', 'infused water', 'ginger shot', 
    'celery juice', 'watermelon juice'
  ],
  'snacks': [
    'chips', 'dip', 'popcorn', 'trail mix', 'nachos', 'pretzel', 'snack', 'cracker', 'granola bar', 'nuts', 
    'jerky', 'fruit bar',
    'hummus', 'veggie sticks', 'rice cakes', 'energy bar', 'pita chips', 'salsa', 'dried fruit', 'cheese sticks', 
    'popped corn', 'seed mix'
  ],
  'general': [
    'recipe', 'cooking', 'food', 'meal', 'dish'
  ]
};
  useEffect(() => {
    if (!user?.id) {
      toast.error('User not logged in. Please log in to create a post.', { position: "top-center" });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    const timestamp = new Date().toISOString();
    setPost((prev) => ({ ...prev, userId: user.id, timestamp }));
    detectLocation();
  }, [user?.id, navigate]);

  // Category detection with debouncing
  useEffect(() => {
    const detectCategory = (description) => {
      if (!description) {
        setPost((prev) => ({ ...prev, category: 'general' }));
        return;
      }

      // Tokenize: lowercase, remove punctuation, split into words
      const tokens = description
        .toLowerCase()
        .replace(/[.,!?]/g, '')
        .split(/\s+/);

      // Match tokens to categories
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => tokens.includes(keyword))) {
          setPost((prev) => ({ ...prev, category }));
          return;
        }
      }
      setPost((prev) => ({ ...prev, category: 'general' }));
    };

    const debouncedDetectCategory = debounce(detectCategory, 300);

    debouncedDetectCategory(post.description);

    // Cleanup: Cancel debounce on unmount or description change
    return () => {
      debouncedDetectCategory.cancel();
    };
  }, [post.description]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported by your browser.', { position: "top-center" });
      return;
    }
    if (isListening) {
      toast.info('Already listening...', { position: "top-center" });
      return;
    }

    const recognition = new SpeechRecognition();
    window.SpeechRecognitionInstance = recognition;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      toast.error('Failed to start speech recognition.', { position: "top-center" });
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('');
      setPost((prev) => ({ ...prev, description: transcript }));
    };
    recognition.onerror = (event) => {
      toast.error(`Speech error: ${event.error}`, { position: "top-center" });
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
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser.', { position: "top-center" });
      return;
    }
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
          toast.error('Could not fetch location.', { position: "top-center" });
        }
      },
      () => toast.error('Location access denied.', { position: "top-center" })
    );
  };

  const handleFileSelect = (e) => handleFileValidation(Array.from(e.target.files));
  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFileValidation(Array.from(e.dataTransfer.files));
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleFileValidation = (files) => {
    const maxImageSize = 2 * 1024 * 1024; // 2MB
    const maxImages = 3;
    const maxVideos = 1;
    const currentImages = mediaFiles.filter(f => f.file?.type?.startsWith('image')).length;
    const currentVideos = mediaFiles.filter(f => f.file?.type === 'video/mp4').length;

    const newFiles = [];
    for (let file of files) {
      if (!permittedMediaTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only PNG, JPEG, and MP4 allowed.`, { position: "top-center" });
        continue;
      }

      if (file.type.startsWith('image')) {
        if (file.size > maxImageSize) {
          toast.error(`Image too large: ${file.name}. Maximum 2MB allowed.`, { position: "top-center" });
          continue;
        }
        if (currentImages + newFiles.filter(f => f.type?.startsWith('image')).length >= maxImages) {
          toast.error(`Maximum ${maxImages} images allowed.`, { position: "top-center" });
          continue;
        }
        newFiles.push({ file, url: URL.createObjectURL(file), type: file.type });
      }

      if (file.type === 'video/mp4') {
        if (currentVideos + newFiles.filter(f => f.type === 'video/mp4').length >= maxVideos) {
          toast.error('Only one video is allowed.', { position: "top-center" });
          continue;
        }
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          if (video.duration > 30) {
            toast.error(`Video too long: ${file.name}. Maximum 30 seconds allowed.`, { position: "top-center" });
          } else {
            newFiles.push({ file, url: URL.createObjectURL(file), type: file.type });
          }
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(file);
      }
    }

    if (newFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) =>
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));

  const moveFile = (index, direction) => {
    const files = [...mediaFiles];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < files.length) {
      [files[index], files[newIndex]] = [files[newIndex], files[index]];
      setMediaFiles(files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const mediaUrls = [];
      const mediaTypes = [];
      let totalProgress = 0;

      for (let media of mediaFiles) {
        const file = media.file;
        if (!file) continue;
        const storageRef = ref(storage, `posts/${user.id}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              totalProgress = Math.min(100, totalProgress + progress / mediaFiles.length);
              setUploadProgress(Math.round(totalProgress));
            },
            (error) => {
              toast.error(`Upload failed: ${error.message}`, { position: "top-center" });
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              mediaUrls.push(downloadURL);
              mediaTypes.push(file.type.startsWith('video') ? 'video' : 'image');
              resolve();
            }
          );
        });
      }

      const newPost = { ...post, mediaUrls, mediaTypes };
      await axios.post('http://localhost:8080/api/posts/create', newPost, {
        withCredentials: true,
      });
      toast.success('Post created successfully!', { position: "top-center" });
      setTimeout(() => navigate('/postfeed'), 1500);
    } catch (err) {
      console.error('❌ Error submitting post:', err);
      toast.error(`Failed to create post: ${err.response?.data?.message || err.message}`, { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Topic</label>
          <textarea
            name="topic"
            value={post.topic}
            onChange={handleInputChange}
            placeholder="Post topic (e.g., My favorite recipe)"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="relative">
          <label className="block font-semibold mb-1 text-gray-700">Description</label>
          <textarea
            name="description"
            value={post.description}
            onChange={handleInputChange}
            placeholder="Describe your post (e.g., Just made a delicious burger!)"
            className="w-full p-3 border rounded-lg pr-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="absolute right-3 top-12 flex items-center space-x-2">
            <button
              type="button"
              onClick={startListening}
              disabled={isListening || !SpeechRecognition}
              className={`text-sm px-3 py-1 rounded-lg transition ${
                isListening || !SpeechRecognition
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              🎤 Speak
            </button>
            <button
              type="button"
              onClick={stopListening}
              disabled={!isListening}
              className={`text-sm px-3 py-1 rounded-lg transition ${
                !isListening
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              🛑 Stop
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-white border rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="en-US">English</option>
              <option value="si-LK">Sinhala</option>
              <option value="ta-IN">Tamil</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={post.category}
            onChange={handleInputChange}
            placeholder="Category (auto-filled or type your own)"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="text"
            name="location"
            placeholder="Location will auto-fill..."
            value={post.location}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={detectLocation}
            disabled={!navigator.geolocation}
            className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            📍
          </button>
        </div>

        <div
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          className="w-full p-6 border-2 border-dashed border-blue-400 rounded-lg text-center text-gray-600 hover:bg-gray-50 transition"
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
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ❌
                </button>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, -1)}
                    className="absolute left-2 top-2 bg-blue-500 text-white p-1 text-xs rounded"
                  >
                    ⬆️
                  </button>
                )}
                {i < mediaFiles.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, 1)}
                    className="absolute left-2 bottom-2 bg-blue-500 text-white p-1 text-xs rounded"
                  >
                    ⬇️
                  </button>
                )}
                {p.type?.startsWith('video') ? (
                  <video
                    src={p.url}
                    controls
                    className="w-full max-h-40 object-cover rounded"
                  />
                ) : (
                  <img
                    src={p.url}
                    alt="Preview"
                    className="w-full max-h-40 object-cover rounded"
                  />
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

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            isLoading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Creating Post...' : 'Create Post'}
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default CreatePost;