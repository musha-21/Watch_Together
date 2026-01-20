
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import YouTube from "react-youtube";

const socket = io(process.env.REACT_APP_SOCKET_URL);


export default function Room() {
  const { roomId } = useParams();
  
  // ===== USER =====
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  
  // ===== VIDEO =====
  const [videoId, setVideoId] = useState("");
  const [input, setInput] = useState("");
  const ytRef = useRef(null);
  const isSyncing = useRef(false);
  
  // ===== CHAT =====
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  
  // ===== JOIN ROOM =====
  const joinRoom = () => {
    if (!username.trim()) return;
    socket.emit("join-room", roomId);
    setJoined(true);
    setShowPopup(false);
  };
  
  
  //new added
  const [isLocal, setIsLocal] = useState(false);

   const [localVideo, setLocalVideo] = useState("");
   const localRef = useRef(null);
  //  const syncingLocal = useRef(false);



    useEffect(() => {
        socket.on("load-video", (id) => {
          setVideoId(id);
          setLocalVideo("");
          setIsLocal(false);
        });

        socket.on("load-local-video", (url) => {
          setLocalVideo(url);
          setVideoId("");
          setIsLocal(true);
        });

        socket.on("play-video", () => {
          if (isLocal) {
            localRef.current && localRef.current.play();
          } else {
            ytRef.current && ytRef.current.playVideo();
          }
        });

        socket.on("pause-video", () => {
          if (isLocal) {
            localRef.current && localRef.current.pause();
          } else {
            ytRef.current && ytRef.current.pauseVideo();
          }
        });

        socket.on("receive-message", (msg) => {
          setMessages((prev) => [...prev, msg]);
        });

        return () => {
          socket.removeAllListeners();
        };
      }, [isLocal]);


  // ===== HELPERS =====
  const extractVideoId = (url) => {
    const reg = /^.*(youtu.be\/|v\/|watch\?v=|embed\/)([^#&?]*).*/;
    const match = url.match(reg);
    return match && match[2].length === 11 ? match[2] : null;
  };

    const handlePlay = () => {
  if (!joined) return;

  socket.emit("play-video", roomId);

  if (isLocal) {
    localRef.current && localRef.current.play();
  } else {
    ytRef.current && ytRef.current.playVideo();
  }
};

    const handlePause = () => {
  if (!joined) return;

  socket.emit("pause-video", roomId);

  if (isLocal) {
    localRef.current && localRef.current.pause();
  } else {
    ytRef.current && ytRef.current.pauseVideo();
  }
};





  const loadVideo = () => {
    if (!joined) return alert("Join room first");
    const id = extractVideoId(input);
    if (!id) return alert("Invalid YouTube link");
    socket.emit("load-video", { roomId, videoId: id });
  };

  const onStateChange = (e) => {
    if (isSyncing.current) return;

    const time = ytRef.current.getCurrentTime();

    if (e.data === 1) {
      socket.emit("play-video", roomId);
      socket.emit("seek-video", { roomId, time });
    }
    if (e.data === 2) {
      socket.emit("pause-video", roomId);
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !joined) return;

    socket.emit("send-message", {
      roomId,
      user: username,
      message: chatInput,
      time: new Date().toLocaleTimeString(),
    });

    setChatInput("");
  };

  console.log("SOCKET URL:", process.env.REACT_APP_SOCKET_URL);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* USERNAME POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="glass p-8 rounded-xl w-72 text-center">
            <h2 className="text-lg font-bold mb-4">Enter your name</h2>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 rounded bg-black/40 mb-3"
            />
            <button
              onClick={joinRoom}
              className="w-full bg-red-600 py-3 rounded font-semibold"
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-red-600">ZAALIMA</h1>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Invite link copied!");
          }}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          🔗 Invite
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* VIDEO SECTION */}
        <div className="lg:col-span-4 glass p-6 rounded-xl">
          
          {/* YOUTUBE LINK INPUT */}
          <div className="flex gap-2 mb-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste YouTube link"
              className="flex-1 p-3 rounded bg-black/40"
            />
            <button onClick={loadVideo} className="bg-red-600 px-4 rounded">
              Load
            </button>
          </div>


                    {/* PLAYER */}
          {videoId && (
            <YouTube
              videoId={videoId}
              onReady={(e) => (ytRef.current = e.target)}
              onStateChange={onStateChange}
              opts={{
                width: "100%",
                height: window.innerWidth < 768 ? "220" : "560",
              }}
            />
          )}

  

      {localVideo && (
        <video
          ref={localRef}
          src={`http://localhost:5000${localVideo}`}
          controls
          className="w-full mt-4 rounded"
          onPlay={() => socket.emit("play-video", roomId)}
          onPause={() => socket.emit("pause-video", roomId)}
        />
      )}



          {!videoId && !localVideo && (
            <div className="h-60 bg-gray-900 rounded flex items-center justify-center">
              Waiting for video…
            </div>
          )}


          {/* CONTROLS */}
          <div className="mt-3 flex gap-2 sticky bottom-0 bg-black/70 p-2 rounded-xl">

                {/* <button
                onClick={() => {
                  socket.emit("play-video", roomId);

                  if (videoId) {
                    ytRef.current?.playVideo();
                  }

                  if (localVideo) {
                    const time = localRef.current.currentTime;
                    socket.emit("seek-video", { roomId, time });
                    localRef.current?.play();
                  }
                }}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl"
              >
                ▶ Play
              </button> */}
{/* 
              <button
              onClick={() => {
                socket.emit("pause-video", roomId);

                if (videoId) {
                  ytRef.current?.pauseVideo();
                }

                if (localVideo) {
                  localRef.current?.pause();
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl"
            >
              ⏸ Pause
            </button> */}

            <button onClick={handlePlay} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl">▶ Play</button>
            <button onClick={handlePause} className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl">⏸ Pause</button>



            <label
            htmlFor="videoUpload"
            className="cursor-pointer bg-purple-600 hover:bg-purple-700
                      px-6 py-3 rounded-xl font-semibold"
          >
            📁 Upload Video
          </label>
           <span className="text-sm text-gray-400 truncate max-w-xs">
              {localVideo ? "Video selected" : "No file selected"}
            </span>

          <input
            id="videoUpload"
            type="file"
            accept="video/*"
            hidden
            // onChange={async (e) => {
            //   if (!joined) return alert("Join room first");

            //   const file = e.target.files[0];
            //   if (!file) return;

            //   const formData = new FormData();
            //   formData.append("video", file);

            //   const res = await fetch("http://localhost:5000/upload", {
            //     method: "POST",
            //     body: formData,
            //   });

            //   const data = await res.json();

            //   socket.emit("load-local-video", {
            //     roomId,
            //     videoUrl: data.videoUrl,
            //   });
            // }}
            onChange={async (e) => {
              if (!joined) return alert("Join room first");

              const file = e.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("video", file);

              try {
                const res = await fetch("http://localhost:5000/upload", {
                  method: "POST",
                  body: formData,
                });

                const data = await res.json();

                // ✅ IMPORTANT
                setLocalVideo(data.videoUrl);
                setVideoId("");
                setIsLocal(true);

                socket.emit("load-local-video", {
                  roomId,
                  videoUrl: data.videoUrl,
                });
              } catch (err) {
                console.error("Upload failed", err);
                alert("Video upload failed");
              }
            }}

          />

          </div>
        </div>

        {/* CHAT SECTION */}
        <div className="glass rounded-2xl p-4 shadow-xl flex flex-col h-[620px]">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <h3 className="font-semibold text-lg">💬 Chat</h3>
            <span className="text-xs text-gray-400">{messages.length} messages</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-10">
                No messages yet 👀 <br /> Start the conversation
              </p>
            )}

            {messages.map((m, i) => {
              const isMe = m.user === username;
              return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow
                    ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-black/40 border border-white/10 rounded-bl-md"
                    }`}
                  >
                    <div className="text-xs opacity-80 mb-1">
                      {!isMe && <span className="text-green-400 font-semibold">{m.user}</span>}
                      <span className="ml-2 text-gray-400">{m.time}</span>
                    </div>
                    {m.message}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
