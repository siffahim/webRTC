import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/Socket";
import peer from "../service/peer";

const RoomPage = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    // console.log("Email ", email, "Id", id);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    // my video, audio stream on here
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    //create offer for me
    const offer = await peer.getOffer();

    //send offer to another user
    socket.emit("user-call", { to: remoteSocketId, offer });

    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call-accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans);
    console.log("Call Accepted!");
    // sendStreams();
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer-nego-needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);

    return () =>
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  }, [handleNegoNeeded]);

  const handleNegoNeededIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer-nego-done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeededFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  });

  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("peer-nego-needed", handleNegoNeededIncoming);
    socket.on("peer-nego-final", handleNegoNeededFinal);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("peer-nego-needed", handleNegoNeededIncoming);
      socket.off("peer-nego-final", handleNegoNeededFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoNeededFinal,
  ]);

  return (
    <div className="room-container">
      <h2>Room Page </h2>
      <h2>{remoteSocketId ? "Connected" : "No one in room"}</h2>
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            width="500px"
            height="300px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            width="500px"
            height="300px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;
