// import { useParams } from "react-router-dom";
// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import YouTube from "react-youtube";

// const socket = io("http://localhost:5000");

// export default function Room() {
//   const { roomId } = useParams();

//   // ===== USER =====
//   const [username, setUsername] = useState("");
//   const [showNamePopup, setShowNamePopup] = useState(true);
//   const [joined, setJoined] = useState(false);

//   // ===== VIDEO =====
//   const [videoId, setVideoId] = useState("");
//   const [localVideo, setLocalVideo] = useState("");
//   const [input, setInput] = useState("");

//   const ytRef = useRef(null);
//   const localRef = useRef(null);

//   // ===== CHAT =====
//   const [messages, setMessages] = useState([]);
//   const [chatInput, setChatInput] = useState("");

//   // ===== JOIN ROOM =====
//   const joinRoom = () => {
//     if (!username.trim()) return;
//     socket.emit("join-room", roomId);
//     setJoined(true);
//     setShowNamePopup(false);
//   };

//   // ===== SOCKET LISTENERS =====
//   useEffect(() => {
//     socket.on("load-video", (id) => {
//       setVideoId(id);
//       setLocalVideo("");
//     });

//     socket.on("load-local-video", (url) => {
//       setLocalVideo(url);
//       setVideoId("");
//     });

//     socket.on("play-video", () => {
//       ytRef.current?.playVideo();
//       localRef.current?.play();
//     });

//     socket.on("pause-video", () => {
//       ytRef.current?.pauseVideo();
//       localRef.current?.pause();
//     });

//     socket.on("receive-message", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     return () => {
//       socket.off("load-video");
//       socket.off("load-local-video");
//       socket.off("play-video");
//       socket.off("pause-video");
//       socket.off("receive-message");
//     };
//   }, []);

//   // ===== HELPERS =====
//   const extractVideoId = (url) => {
//     const reg =
//       /^.*(youtu.be\/|v\/|embed\/|watch\?v=)([^#&?]*).*/;
//     const match = url.match(reg);
//     return match && match[2].length === 11 ? match[2] : null;
//   };

//   const loadVideo = () => {
//     if (!joined) return alert("Join room first");
//     const id = extractVideoId(input);
//     if (!id) return alert("Invalid YouTube link");

//     setVideoId(id);
//     setLocalVideo("");
//     socket.emit("load-video", { roomId, videoId: id });
//   };

//   // ===== PLAY / PAUSE (FIXED LOGIC) =====
//   const handlePlay = () => {
//     if (!joined) return;
//     ytRef.current?.playVideo();
//     localRef.current?.play();
//     socket.emit("play-video", roomId);
//   };

//   const handlePause = () => {
//     if (!joined) return;
//     ytRef.current?.pauseVideo();
//     localRef.current?.pause();
//     socket.emit("pause-video", roomId);
//   };

//   // ===== CHAT =====
//   const sendMessage = () => {
//     if (!chatInput.trim() || !joined) return;

//     const msg = {
//       roomId,
//       user: username,
//       message: chatInput,
//       time: new Date().toLocaleTimeString(),
//     };

//     socket.emit("send-message", msg);
//     setMessages((prev) => [...prev, msg]);
//     setChatInput("");
//   };

//   // ===== UI =====
//   return (
//     <div className="min-h-screen bg-black text-white p-6">

//       {/* USERNAME POPUP */}
//       {showNamePopup && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//           <div className="glass p-8 rounded-xl w-72 text-center">
//             <h2 className="text-lg font-bold mb-4">Enter your name</h2>
//             <input
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Your name"
//               className="w-full p-3 mb-4 rounded bg-black/40"
//             />
//             <button
//               onClick={joinRoom}
//               className="w-full bg-red-600 py-3 rounded font-semibold"
//             >
//               Join Room
//             </button>
//           </div>
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="flex justify-between mb-6">
//         <h1 className="text-2xl font-bold text-red-600">ZAALIMA</h1>
//         <button
//           onClick={() => {
//             navigator.clipboard.writeText(window.location.href);
//             alert("Invite link copied!");
//           }}
//           className="bg-purple-600 hover:bg-purple-700 transition
//              px-5 py-3 rounded-xl font-semibold text-sm"
//         >
//           🔗 Invite
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

//         {/* VIDEO SECTION */}
//         <div className="lg:col-span-4 glass p-6 rounded-xl">

//           {/* LOCAL VIDEO UPLOAD */}
//           {/* LOCAL VIDEO UPLOAD */}
// <div className="flex items-center gap-4 mb-6">
//   <label
//     htmlFor="videoUpload"
//     className="cursor-pointer bg-purple-600 hover:bg-purple-700 transition
//              px-6 py-4 lg:py-3 rounded-xl font-semibold"
//   >
//     📁 Upload Video
//   </label>

//   <span className="text-sm text-gray-400 truncate max-w-xs">
//     {localVideo ? "Video selected" : "No file selected"}
//   </span>

//   <input
//     id="videoUpload"
//     type="file"
//     accept="video/*"
//     hidden
//     onChange={(e) => {
//       if (!joined) return alert("Join room first");

//       const file = e.target.files[0];
//       if (!file) return;

//       const formData = new FormData();
//       formData.append("video", file);

//       fetch("http://localhost:5000/upload", {
//         method: "POST",
//         body: formData,
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           setLocalVideo(data.videoUrl);
//           setVideoId("");
//           socket.emit("load-local-video", {
//             roomId,
//             videoUrl: data.videoUrl,
//           });
//         });
//     }}
//   />
// </div>


//           {/* YOUTUBE INPUT */}
//           <div className="flex gap-2 my-4">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Paste YouTube link"
//               className="flex-1 p-3 rounded bg-black/40"
//             />
//             <button
//               onClick={loadVideo}
//               className="bg-red-600 px-4 rounded"
//             >
//               Load
//             </button>
//           </div>

//           {/* PLAYERS */}
//           {videoId && (
//             <YouTube
//             videoId={videoId}
//             onReady={(e) => (ytRef.current = e.target)}
//             opts={{
//               width: "100%",
//               height: window.innerWidth < 768 ? "220" : "560",
//             }}
//           />

  
//           )}

//           {localVideo && (
//             <video
//               ref={localRef}
//               src={localVideo}
//               controls
//               className="w-full mt-4 rounded"
//             />
//           )}

//           {/* CONTROLS */}
//           <div className="flex gap-4 mt-4">
//             <button
//               onClick={handlePlay}
//               className="bg-green-600 hover:bg-green-700 transition
//                         px-6 py-4 lg:py-3 rounded-xl text-base font-semibold"
//             >
//               ▶ Play
//             </button>

//             <button
//               onClick={handlePause}
//               className="bg-yellow-500 hover:bg-yellow-600 transition
//                         px-6 py-4 lg:py-3 rounded-xl text-base font-semibold"
//             >
//               ⏸ Pause
//             </button>



//           </div>
//         </div>

//         {/* CHAT */}

//         {/* CHAT SECTION */}
//    <div className="glass rounded-2xl p-4 shadow-xl flex flex-col
//                 h-[60vh] lg:h-[620px] mt-4 lg:mt-0">


//   {/* CHAT HEADER */}
//   <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
//     <h3 className="font-semibold text-lg">💬 Chat</h3>
//     <span className="text-xs text-gray-400">
//       {messages.length} messages
//     </span>
//   </div>

//   {/* MESSAGES */}
//   <div className="flex-1 overflow-y-auto space-y-3 pr-1">
//     {messages.length === 0 && (
//       <p className="text-center text-gray-500 text-sm mt-10">
//         No messages yet 👀  
//         <br />Start the conversation
//       </p>
//     )}

//     {messages.map((m, i) => {
//       const isMe = m.user === username;

//       return (
//         <div
//           key={i}
//           className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//         >
//           <div
//             className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow
//               ${
//                 isMe
//                   ? "bg-blue-600 text-white rounded-br-md"
//                   : "bg-black/40 border border-white/10 rounded-bl-md"
//               }`}
//           >
//             <div className="text-xs opacity-80 mb-1">
//               {!isMe && (
//                 <span className="text-green-400 font-semibold">
//                   {m.user}
//                 </span>
//               )}
//               {m.time && (
//                 <span className="ml-2 text-gray-400">
//                   {m.time}
//                 </span>
//               )}
//             </div>

//             <div className="break-words">{m.message}</div>
//           </div>
//         </div>
//       );
//     })}
//   </div>

//   {/* INPUT AREA */}
//   <div className="mt-3 flex gap-2 sticky bottom-0 bg-black/70 p-2 rounded-xl">

//     <input
//       value={chatInput}
//       onChange={(e) => setChatInput(e.target.value)}
//       placeholder="Type a message…"
//       className="flex-1 px-4 py-3 rounded-xl bg-black/40
//                  border border-white/10 focus:outline-none
//                  focus:ring-2 focus:ring-blue-600 text-sm"
//       onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//     />

//     <button
//       onClick={sendMessage}
//       className="bg-blue-600 hover:bg-blue-700 transition
//                  px-5 py-3 rounded-xl font-semibold shadow text-sm"
//     >
//       Send
//     </button>
//   </div>
// </div>


//       </div>
//     </div>
//   );
// }





import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function Home() {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = uuid().slice(0, 6);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold text-red-600">ZAALIMA</h1>

      <button
        onClick={createRoom}
        className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold"
      >
        🎬 Create Watch Room
      </button>
    </div>
  );
}
