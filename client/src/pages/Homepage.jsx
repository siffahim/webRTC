import React, { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../providers/Socket";

const Homepage = () => {
  const { socket } = useSocket();
  const emailRef = useRef();
  const roomRef = useRef();
  const navigate = useNavigate();

  const handleRoomJoin = useCallback(
    (data) => {
      const { email, room } = data;

      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room-join", handleRoomJoin);

    return () => socket.off("room-join", handleRoomJoin);
  }, [socket, handleRoomJoin]);

  const handleSubmitJoinRoom = useCallback(() => {
    const email = emailRef.current.value;
    const room = roomRef.current.value;

    socket.emit("join-room", { email, room });
  }, [socket]);

  return (
    <div className="home-container">
      <div>
        <input type="email" placeholder="Email" ref={emailRef} />
        <input type="text" placeholder="Room ID" ref={roomRef} />
        <button onClick={handleSubmitJoinRoom}>Join Room</button>
      </div>
    </div>
  );
};

export default Homepage;
