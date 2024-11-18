import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatState from '../components/Message/ChatState'; 
import './messages.css'; 

const Messages = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return <ChatState />;
};

export default Messages;
