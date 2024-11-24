import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Login } from "./user/Login";
import { Register } from "./user/Register";
import Messages from "./Messages";
import Conversation from "./Conversation";
import { Navbar } from './components/Navbar';
import RoomConversation from "./RoomConversation";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token") // Vérifiez si le token existe au démarrage de l'application
  );

  useEffect(() => {
    // Vos autres logiques (Pusher, notifications, etc.)
  }, [isAuthenticated]);

  return (
    <>
      {/* Navbar visible sur toutes les pages */}
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
