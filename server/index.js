const express = require("express");
const path = require("path");

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/videoConferencing", (req, res) => {
  let rand = Math.floor(Math.random() * 6) + 1;

  const user = {
    username: `dummy${rand}`,
    email: `Dummy${rand}@gmail.com`,
    ownedRoomList: [],
    participatedRoomList: [],
  };

  // const user = {
  //   username: req.body.username,
  //   email: req.body.email,
  //   ownedRoomList: [],
  //   participatedRoomList: [],
  // };

  res.json(user);
  console.log(user);
});

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log("App is listening on port " + port);
