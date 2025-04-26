import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Profile from "./pages/private/Profile";
import Feed from "./pages/private/Feed";
import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import Register from "./pages/public/Register";
import EditProfile from "./pages/private/EditProfile";

//import CommentPage from "./pages/private/Comment/Comment";
//import CreatePost from "./pages/private/Post/CreatePost";
//import EditPost  from "./pages/private/Post/EditPost";
//import PostFeed from "./pages/private/Post/PostFeed";

import AllUsers from "./pages/private/AllUsers";
import Following from "./pages/private/Following";
import Followers from "./pages/private/Followers";

import FriendsProfile from "./pages/private/FriendsProfile";


import CreatePost from "./pages/private/PostManagement/CreatePost";
import EditPost from "./pages/private/PostManagement/EditPost";
import PostFeed from "./pages/private/PostManagement/PostFeed";


function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/editprofile/:id" element={<EditProfile />} />
            <Route path="/allusers" element={<AllUsers />} />
            <Route path="/following" element={<Following />} />
            <Route path="/followers" element={<Followers />} />
            <Route path="/frendsprofile/:id" element={<FriendsProfile/>} />
            <Route path="/feed" element={<Feed />} />


            <Route path="/createpost" element={<CreatePost />} />
            <Route path="/editpost" element={<EditPost/>} />
            <Route path="/postfeed" element={<PostFeed/>} />



          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
