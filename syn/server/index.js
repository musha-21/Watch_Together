

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Ensure uploads folder exists =====
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// ===== Serve uploaded videos =====
app.use("/videos", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ===== ROOM STATE =====
const rooms = {};

// ===== MULTER CONFIG =====
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===== SOCKET EVENTS =====
io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined ${roomId}`);

    if (rooms[roomId]) {
      const room = rooms[roomId];

      if (room.videoType === "youtube") {
        socket.emit("load-video", room.videoId);
      } else {
        socket.emit("load-local-video", room.videoId);
      }

      socket.emit("sync-playback", {
        playing: room.playing,
        currentTime: room.currentTime,
      });
    }
  });

  socket.on("load-video", ({ roomId, videoId }) => {
    rooms[roomId] = {
      videoType: "youtube",
      videoId,
      playing: false,
      currentTime: 0,
    };
    io.to(roomId).emit("load-video", videoId);
  });

  socket.on("load-local-video", ({ roomId, videoUrl }) => {
    rooms[roomId] = {
      videoType: "local",
      videoId: videoUrl,
      playing: false,
      currentTime: 0,
    };
    io.to(roomId).emit("load-local-video", videoUrl);
  });

 


  socket.on("play-video", ({ roomId, time }) => {
  if (rooms[roomId]) {
    rooms[roomId].playing = true;
    rooms[roomId].currentTime = time;
  }
  socket.to(roomId).emit("play-video", time);
});

socket.on("pause-video", ({ roomId, time }) => {
  if (rooms[roomId]) {
    rooms[roomId].playing = false;
    rooms[roomId].currentTime = time;
  }
  socket.to(roomId).emit("pause-video", time);
});


  socket.on("seek-video", ({ roomId, time }) => {
    if (rooms[roomId]) rooms[roomId].currentTime = time;
    socket.to(roomId).emit("seek-video", time);
  });

  socket.on("send-message", (msg) => {
    io.to(msg.roomId).emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED:", socket.id);
  });
});

// ===== UPLOAD API =====
app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ videoUrl: `/videos/${req.file.filename}` });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
