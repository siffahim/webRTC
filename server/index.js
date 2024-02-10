const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const io = new Server(8000, { cors: true });
//const app = express();

//parser
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extends: true }));

//socket connect
const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("join-room", (data) => {
    const { room, email } = data;
    console.log("User", email, "Joined Room", room);

    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(room).emit("user-joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room-join", data);

    // socket.emit("joined-room", { roomId });
    // socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("user-call", ({ to, offer }) => {
    io.to(to).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", ({ to, ans }) => {
    io.to(to).emit("call-accepted", { from: socket.id, ans });
  });

  socket.on("peer-nego-needed", ({ to, offer }) => {
    io.to(to).emit("peer-nego-needed", { from: socket.id, offer });
  });

  socket.on("peer-nego-done", ({ to, ans }) => {
    io.to(to).emit("peer-nego-final", { from: socket.id, ans });
  });
});

//listening
// app.listen(8000, () => console.log("Http server running at PORT 8000"));
// io.listen(8001);
