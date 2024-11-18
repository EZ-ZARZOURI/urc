import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessageToConversation } from "../../store/messagingSlice";

const MessageForm = () => {
  const dispatch = useDispatch();
  const currentConversation = useSelector(state => state.messaging.currentConversation);
  const [message, setMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message.trim() === "") {
      return;
    }

    const newMessage = {
      sender: "currentUser",
      content: message,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessageToConversation(newMessage));
    setMessage("");
  };

  if (!currentConversation) {
    return <p>Please select a conversation to start chatting.</p>;
  }

  return (
    <form onSubmit={handleSendMessage} className="message-form">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        required
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default MessageForm;
