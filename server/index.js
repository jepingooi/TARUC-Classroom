const express = require("express");
const path = require("path");
const app = express();

const http = require("http");
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID, userID) => {
    console.log("join room", socket.id);
    let tempUser = { socketID: socket.id, userID: userID };
    if (users[roomID]) users[roomID].push(tempUser);
    else users[roomID] = [tempUser];

    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(
      (user) => user.socketID !== socket.id
    );
    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    console.log("sending signal", socket.id);
    let userID = "";
    users[payload.roomID].forEach((user) => {
      if (user.socketID === payload.callerID) userID = user.userID;
    });

    // Signal existing user
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      userID: userID,
      type:
        userID.split("_")[0] === "shareScreen" ? "screenSharing" : "default",
    });
  });

  socket.on("returning signal", (payload) => {
    console.log("returning signal", socket.id);
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((user) => user.socketID !== socket.id);
      users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
  });

  socket.on("change", (payload) => {
    socket.broadcast.emit("change", payload);
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.PROD) {
  app.use(express.static(__dirname + "/client/build"));
  app.get("*", (request, response) => {
    response.sendFile(path.join(__dirname, "client/build/index.html"));
  });
}

server.listen(process.env.PORT || 5000, () =>
  console.log("App is listening on port " + PORT)
);
