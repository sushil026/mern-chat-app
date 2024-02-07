const express = require("express");
const bcrypt = require("bcrypt");
const ws = require("ws");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const User = require("./models/User");
const Message = require("./models/Message");

require("dotenv").config();
app = express();
app.use(cookieParser());
const jwt_secret = process.env.JWT_SECRET;
const bcrypt_salt = bcrypt.genSaltSync(10);

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "https://mern-chat-beige.vercel.app",
    allowedHeaders: ["Content-Type", "Authorization", "other-header"],
  })
);

mongoose
  .connect(process.env.MONGOURL)
  .then(() => {
    console.log(
      "Server running Successfully at http://localhost:" + process.env.PORT
    );
  })
  .catch((err) => {
    console.log("Something went wrong!");
    console.log(err);
  });

app.get("/", (req, res) => {
  res.json("response|");
});

async function fetchingUser(req, res) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwt_secret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await fetchingUser(req);
  const Messages = await Message.find({
    sender: { $in: [userId, userData.userId] },
    recipient: { $in: [userId, userData.userId] },
  }).sort({ createdAt: 1 });
  res.json(Messages);
});

app.get("/profile", async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwt_secret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.get("/users", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOK = bcrypt.compareSync(password, foundUser.password);
    if (passOK) {
      jwt.sign(
        { userId: foundUser._id, username },
        jwt_secret,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(201)
            .json({
              id: foundUser._id,
            });
        }
      );
    }
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcrypt_salt);
  const createdUser = await User.create({
    username: username,
    password: hashedPassword,
  });
  jwt.sign(
    { userId: createdUser._id, username },
    jwt_secret,
    {},
    (err, token) => {
      if (err) throw err;
      res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
          id: createdUser._id,
        });
    }
  );
});

app.post("/logout", async (req, res) => {
  res.cookie("token", "", { sameSite: "none", secure: true }).json("ok");
});

const server = app.listen(process.env.PORT);
const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, res) => {
  function notifyConnectionStatus() {
    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  }

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      connection.terminate();
      notifyConnectionStatus();
      clearInterval(connection.timer);
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  const cookies = res.headers.cookie;
  if (cookies) {
    const tokenString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenString) {
      const token = tokenString.split("=")[1];
      if (token) {
        jwt.verify(token, jwt_secret, {}, (err, userData) => {
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    message = JSON.parse(message.toString());
    const { recipient, text } = message;
    if (recipient && text) {
      const msgDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });
      [...wss.clients]
        .filter((client) => client.userId === recipient)
        .forEach((client) =>
          client.send(
            JSON.stringify({
              text,
              recipient,
              sender: connection.userId,
              _id: msgDoc._id,
            })
          )
        );
    }
  });
  notifyConnectionStatus();
});
