import React from "react";
import { Routes, Route } from "react-router-dom";
import CreatePost from "./components/CreatePost";
import RideList from "./components/RideList";
import Home from "./components/Home";
import Marketplace from "./components/Marketplace";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import UserProfile from "./components/UserProfile";
import Chat from "./components/Chat";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Google auth page */}
      <Route path="/auth" element={<LoginPage />} />

      {/* Example other routes */}
      <Route path="/Home" element={<Home />} />
      <Route path="/create-ride" element={<CreatePost />} />
      <Route path="/rides" element={<RideList />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/chat/:id" element={<Chat />} />
    </Routes>
  );
};

export default App;
