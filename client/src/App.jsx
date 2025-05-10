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


import CreateLearningPlan from "./pages/private/LearningPlans/CreateLearningPlan";
import LearningPlanList from "./pages/private/LearningPlans/LearningPlansList";
import EditLearningPlan from "./pages/private/LearningPlans/EditLearningPlan";

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
import CreateProgressUpdate from "./pages/private/LearningPlans/CreateProgressUpdate";
import ProgressUpdate from "./pages/private/LearningPlans/ProgressUpdate";


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


            <Route path="/learning-plans" element={<LearningPlanList />} />
            <Route path="/create-learning-plans" element={<CreateLearningPlan />} />
            <Route path="/edit-learning-plan/:id" element={<EditLearningPlan />} />
            <Route path="/progress-template/:id" element={<CreateProgressUpdate />} />
            <Route path="/progress-feed" element={<ProgressUpdate />} />


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
