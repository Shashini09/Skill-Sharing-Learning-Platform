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
import NotificationsPage from "./pages/private/NotificationPage";

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
          <Route path="/notifications" element={<NotificationsPage/>}/>
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/editprofile/:id" element={<EditProfile />} />
            <Route path="/feed" element={<Feed />} />
    
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
