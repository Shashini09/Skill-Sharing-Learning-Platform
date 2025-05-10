import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState({
    userId: "",
    content: "",
    description: "",
    mediaUrls: [],
    mediaTypes: [],
    isPrivate: false,
    taggedFriends: [],
  });

  const [mediaFiles, setMediaFiles] = useState([]); // [{ file, url, existing, type }]
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/posts/${id}`);
        setPost(res.data);
        setMediaFiles(
          res.data.mediaUrls.map((url, i) => ({
            file: null,
            url,
            existing: true,
            type: res.data.mediaTypes[i],
          }))
        );
      } catch (err) {
        toast.error("Failed to load post.");
      }
    };
    fetchPost();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPost({ ...post, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFileValidation(selectedFiles);
  };

  const handleFileValidation = (selectedFiles) => {
    const validFiles = [];

    if (mediaFiles.length >= MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files.`);
      return;
    }

    selectedFiles.forEach((file) => {
      if (mediaFiles.length + validFiles.length >= MAX_FILES) return;
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File type not allowed: ${file.name}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large: ${file.name}`);
        return;
      }

      const newFile = {
        file,
        url: URL.createObjectURL(file),
        existing: false,
        type: file.type.startsWith("video") ? "video" : "image",
      };

      if (file.type.startsWith("video")) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          if (video.duration < 30) {
            toast.error(`Video too short (<30s): ${file.name}`);
          } else {
            setMediaFiles((prev) => [...prev, newFile]);
          }
        };
        video.src = newFile.url;
      } else {
        validFiles.push(newFile);
      }
    });

    if (validFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

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

    try {
      const existingMedia = mediaFiles.filter((f) => f.existing);
      const newMedia = mediaFiles.filter((f) => !f.existing);

      const mediaUrls = [];
      const mediaTypes = [];

      for (let i = 0; i < newMedia.length; i++) {
        const formData = new FormData();
        formData.append("file", newMedia[i].file);

        const res = await axios.post(
          "http://localhost:8080/api/posts/upload",
          formData
        );
        mediaUrls.push(res.data);
        mediaTypes.push(
          newMedia[i].file.type.startsWith("video") ? "video" : "image"
        );
      }

      mediaUrls.push(...existingMedia.map((m) => m.url));
      mediaTypes.push(...existingMedia.map((m) => m.type));

      await axios.put(`http://localhost:8080/api/posts/update/${id}`, {
        ...post,
        mediaUrls,
        mediaTypes,
      });

      toast.success("Post updated successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="userId"
          value={post.userId}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="content"
          value={post.content}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          value={post.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.mp4"
          onChange={handleFileSelect}
          className="w-full mt-2"
        />

        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {mediaFiles.map((p, i) => (
              <div key={i} className="relative border p-1 rounded group">
                <button
                  type="button"
                  onClick={() => handleRemoveFile(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  ❌
                </button>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, -1)}
                    className="absolute left-1 top-1 bg-blue-500 text-white p-1 text-xs rounded"
                  >
                    ⬆️
                  </button>
                )}
                {i < mediaFiles.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveFile(i, 1)}
                    className="absolute left-1 bottom-1 bg-blue-500 text-white p-1 text-xs rounded"
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
          />
          <span>Private</span>
        </label>

        <input
          type="text"
          name="taggedFriends"
          value={post.taggedFriends.join(",")}
          onChange={(e) =>
            setPost({ ...post, taggedFriends: e.target.value.split(",") })
          }
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Update Post
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default EditPost;
