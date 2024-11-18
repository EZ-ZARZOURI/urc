import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentConversation } from "../../store/messagingSlice";

const MessageList = () => {
  const currentConversation = useSelector(selectCurrentConversation);

  if (!currentConversation || !currentConversation.messages) {
    return <p>No messages available</p>;
  }

  return (
    <div className="message-list">
      <h2>Messages</h2>
      <ul>
        {currentConversation.messages.length === 0 ? (
          <p>No messages in this conversation</p>
        ) : (
          currentConversation.messages.map((msg, index) => (
            <li key={index} style={{ textAlign: msg.sender === "currentUser" ? "right" : "left" }}>
              <p className="sender">{msg.sender}:</p>
              <p>{msg.content}</p>
              <p className="timestamp">{new Date(msg.timestamp).toLocaleString()}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default MessageList;
