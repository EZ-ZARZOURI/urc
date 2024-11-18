import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUsers, setSelectedConversation } from "../../store/messagingSlice";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.messaging.users);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const fetchedUsers = await response.json();
          dispatch(setUsers(fetchedUsers));
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [dispatch]);

  const handleUserClick = (userId) => {
    dispatch(setSelectedConversation(userId));
    navigate(`/messages/user/${userId}`);
  };

  if (!users || users.length === 0) {
    return <p>No users found</p>;
  }

  return (
    <div className="user-list">
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <button
            key={user.user_id}
            onClick={() => handleUserClick(user.user_id)}
            className="user-list-item"
          >
            <p>{user.username}</p>
            <p>Last active: {user.last_login}</p>
          </button>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
