// src/components/CloseFriends.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function CloseFriends({ userName }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!userName) return; // prevent request if userName is undefined

    axios
      .get(
        `http://localhost:8080/api/comments/close-friends/by-user/${userName}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => setFriends(res.data))
      .catch((err) => console.error(err));
  }, [userName]);

  return (
    <div>
      <h3>Close Friends</h3>
      <ul>
        {friends.map(([friendId, count]) => (
          <li key={friendId}>
            User: {friendId} - Comments: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CloseFriends;
