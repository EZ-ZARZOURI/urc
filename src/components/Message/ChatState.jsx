import React from "react";
import UserList from "./UserList";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm"; 

const ChatState = () => {
  return (
    <div className="messages-container">
      <UserList />
      <div className="messages-container-right">
        <MessageList />
        <MessageForm />
      </div>
    </div>
  );
};

export default ChatState;
