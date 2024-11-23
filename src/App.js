import './App.css';
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Login } from "./user/Login"; // Import Login
import { Register } from "./user/Register";
import Messages from "./Messages";
import Conversation from "./Conversation";
import { Navbar } from './components/Navbar';
import RoomConversation from "./RoomConversation";


function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token") // Check if token exists on app start
  );

  const noHeaderRoutes = ["/login", "/register"];

  return (
    <>
      {/* Navbar should update based on authentication state */}
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Messages />}>
          <Route path="user/:id" element={<Conversation />} />
          <Route path="room/:id" element={<RoomConversation />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
