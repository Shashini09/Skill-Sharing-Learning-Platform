import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import { storage } from "../../../firebase/firebase"; // Adjust the import path based on your file structure
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";

const EditPost = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState({
    userId: "",
    topic: "",
    description: "",

    mediaUrls: [],
    mediaTypes: [],
    isPrivate: false,
    taggedFriends: [],
    location: "",
    timestamp: "",
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch post data and initialize form
  useEffect(() => {
    if (!user?.id) {
      toast.error("User not logged in. Please log in to edit a post.", {
        position: "top-center",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/posts/${id}`, {
          withCredentials: true,
        });
        const fetchedPost = {
          ...res.data,
          userId: res.data.userId || user.id,
          taggedFriends: Array.isArray(res.data.taggedFriends)
            ? res.data.taggedFriends
            : [],
          timestamp: res.data.timestamp || new Date().toISOString(),
        };
        setPost(fetchedPost);
        setMediaFiles(
          res.data.mediaUrls.map((url, i) => ({
            file: null,
            url,
            existing: true,
            type:
              res.data.mediaTypes[i] ||
              (url.includes(".mp4") ? "video" : "image"),
          }))
        );
      } catch (err) {
        toast.error("Failed to load post.", { position: "top-center" });
      }
    };
    fetchPost();
  }, [id, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost({ ...post, [name]: type === "checkbox" ? checked : value });
  };

  const startListening = () => {
    if (!SpeechRecognition)
      return toast.error("Speech recognition not supported.", {
        position: "top-center",
      });
    if (isListening)
      return toast.info("Already listening...", { position: "top-center" });

    const recognition = new SpeechRecognition();
    window.SpeechRecognitionInstance = recognition;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
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
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported.", {
        position: "top-center",
      });
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
          toast.error("Could not fetch location.", { position: "top-center" });
        }
      },
      () => toast.error("Location access denied.", { position: "top-center" })
    );
  };

  const handleFileSelect = (e) =>
    handleFileValidation(Array.from(e.target.files));
  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFileValidation(Array.from(e.dataTransfer.files));
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleFileValidation = (selectedFiles) => {
    const allowedTypes = ["image/png", "image/jpeg", "video/mp4"];
    const requiredImages = 3;
    const maxVideos = 1;
    const currentImages = mediaFiles.filter((f) =>
      f.type.startsWith("image")
    ).length;
    const currentVideos = mediaFiles.filter((f) => f.type === "video").length;

    const newFiles = [];
    for (let file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `Invalid file type: ${file.name}. Only PNG, JPEG, and MP4 allowed.`,
          { position: "top-center" }
        );
        continue;
      }

      if (file.type.startsWith("image")) {
        if (
          currentImages +
            newFiles.filter((f) => f.type?.startsWith("image")).length >=
          requiredImages
        ) {
          toast.error(`Exactly ${requiredImages} images are required.`, {
            position: "top-center",
          });
          continue;
        }
      }

      if (file.type === "video/mp4") {
        if (
          currentVideos +
            newFiles.filter((f) => f.type === "video/mp4").length >=
          maxVideos
        ) {
          toast.error("Only one video is allowed.", { position: "top-center" });
          continue;
        }
      }

      const newFile = {
        file,
        url: URL.createObjectURL(file),
        existing: false,
        type: file.type.startsWith("video") ? "video" : "image",
      };

      if (file.type === "video/mp4") {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          if (video.duration > 30) {
            toast.error(
              `Video too long: ${file.name}. Maximum 30 seconds allowed.`,
              { position: "top-center" }
            );
          } else {
            newFiles.push(newFile);
            setMediaFiles((prev) => [...prev, ...newFiles]);
          }
        };
        video.src = newFile.url;
      } else {
        newFiles.push(newFile);
      }
    }

    if (
      newFiles.length > 0 &&
      !selectedFiles.some((f) => f.type === "video/mp4")
    ) {
      setMediaFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) =>
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));

  const moveFile = (index, direction) => {
    const newFiles = [...mediaFiles];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newFiles.length) {
      [newFiles[index], newFiles[newIndex]] = [
        newFiles[newIndex],
        newFiles[index],
      ];
      setMediaFiles(newFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate exactly 3 images
    const imageCount = mediaFiles.filter((f) =>
      f.type.startsWith("image")
    ).length;
    // if (imageCount !== 3) {
    //   toast.error(`Exactly 3 images are required. Currently ${imageCount} selected.`, { position: "top-center" });
    //   return;
    // }

    try {
      const existingMedia = mediaFiles.filter((f) => f.existing);
      const newMedia = mediaFiles.filter((f) => !f.existing);

      const mediaUrls = [];
      const mediaTypes = [];
      let totalProgress = 0;

      for (let media of newMedia) {
        const file = media.file;
        const storageRef = ref(
          storage,
          `posts/${post.userId}/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              totalProgress = Math.min(
                100,
                totalProgress + progress / newMedia.length
              );
              setUploadProgress(Math.round(totalProgress));
            },
            (error) => {
              toast.error(`Upload failed: ${error.message}`, {
                position: "top-center",
              });
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              mediaUrls.push(downloadURL);
              mediaTypes.push(
                file.type.startsWith("video") ? "video" : "image"
              );
              resolve();
            }
          );
        });
      }

      mediaUrls.push(...existingMedia.map((m) => m.url));
      mediaTypes.push(...existingMedia.map((m) => m.type));

      const updatedPost = {
        ...post,
        mediaUrls,
        mediaTypes,

        taggedFriends: Array.isArray(post.taggedFriends)
          ? post.taggedFriends
          : post.taggedFriends
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
      };

      await axios.put(
        `http://localhost:8080/api/posts/update/${id}`,
        updatedPost,
        {
          withCredentials: true,
        }
      );

      toast.success("Post updated successfully!", { position: "top-center" });
      setTimeout(() => navigate("/postfeed"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post.", { position: "top-center" });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Edit Post</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Topic
          </label>
          <textarea
            name="topic"
            value={post.topic}
            onChange={handleInputChange}
            placeholder="Post topic"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label className="block font-semibold mb-1 text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={post.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-3 border rounded-lg pr-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-12 flex items-center space-x-2">
            <button
              type="button"
              onClick={startListening}
              disabled={isListening}
              className={`text-sm px-3 py-1 rounded-lg transition ${
                isListening
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-700"
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
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
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
            className="text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
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
              <div key={i}>
                <div className="relative border p-2 rounded-lg group">
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
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
                  {p.type === "video" ? (
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
            className="h-4 w-4 text-blue-500"
          />
          <span className="text-gray-700">Private</span>
        </label>

        <input
          type="text"
          name="taggedFriends"
          placeholder="Tagged friends (comma separated)"
          value={post.taggedFriends.join(", ")}
          onChange={(e) =>
            setPost({
              ...post,
              taggedFriends: e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            })
          }
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full py-3 rounded-lg text-white font-semibold bg-blue-500 hover:bg-blue-600 transition"
        >
          Update Post
        </button>
      </form>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default EditPost;
