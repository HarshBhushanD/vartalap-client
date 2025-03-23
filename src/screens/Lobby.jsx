import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/socketProvider";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      setIsLoading(false);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Join Meeting</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your details to join a video call
          </p>
        </div>

        <form onSubmit={handleSubmitForm} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label 
                htmlFor="room" 
                className="block text-sm font-medium text-gray-700"
              >
                Room Code
              </label>
              <input
                type="text"
                id="room"
                required
                placeholder="Enter room code"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !email || !room}
              className={`w-full py-3 px-4 flex justify-center items-center text-white font-medium rounded-md ${
                isLoading || !email || !room
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? (
                <span>Connecting...</span>
              ) : (
                <span>Join Meeting</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;


// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSocket } from "../context/socketProvider";

// const LobbyScreen = () => {
//   const [email, setEmail] = useState("");
//   const [room, setRoom] = useState("");

//   const socket = useSocket();
//   const navigate = useNavigate();

//   const handleSubmitForm = useCallback(
//     (e) => {
//       e.preventDefault();
//       socket.emit("room:join", { email, room });
//     },
//     [email, room, socket]
//   );

//   const handleJoinRoom = useCallback(
//     (data) => {
//       const { email, room } = data;
//       navigate(`/room/${room}`);
//     },
//     [navigate]
//   );

//   useEffect(() => {
//     socket.on("room:join", handleJoinRoom);
//     return () => {
//       socket.off("room:join", handleJoinRoom);
//     };
//   }, [socket, handleJoinRoom]);

//   return (
//     <div>
//       <h1>Lobby</h1>
//       <form onSubmit={handleSubmitForm}>
//         <label htmlFor="email">Email ID</label>
//         <input
//           type="email"
//           id="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <br />
//         <label htmlFor="room">Room Number</label>
//         <input
//           type="text"
//           id="room"
//           value={room}
//           onChange={(e) => setRoom(e.target.value)}
//         />
//         <br />
//         <button>Join</button>
//       </form>
//     </div>
//   );
// };

// export default LobbyScreen;
// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSocket } from "../context/socketProvider";

// const LobbyScreen = () => {
//   const [email, setEmail] = useState("");
//   const [room, setRoom] = useState("");
  
//   const socket = useSocket();
//   const navigate = useNavigate();
  
//   const handleSubmitForm = useCallback(
//     (e) => {
//       e.preventDefault();
//       socket.emit("room:join", { email, room });
//     },
//     [email, room, socket]
//   );
  
//   const handleJoinRoom = useCallback(
//     (data) => {
//       const { email, room } = data;
//       navigate(`/room/${room}`);
//     },
//     [navigate]
//   );
  
//   useEffect(() => {
//     socket.on("room:join", handleJoinRoom);
//     return () => {
//       socket.off("room:join", handleJoinRoom);
//     };
//   }, [socket, handleJoinRoom]);

//   // Inline styles object
//   const styles = {
//     container: {
//       minHeight: '100vh',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       padding: '20px',
//       background: 'linear-gradient(135deg, #f0f4ff 0%, #e6eeff 100%)',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
//     },
//     card: {
//       background: 'white',
//       borderRadius: '12px',
//       boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
//       padding: '32px',
//       width: '100%',
//       maxWidth: '420px'
//     },
//     title: {
//       fontSize: '28px',
//       fontWeight: 700,
//       color: '#4a56e2',
//       textAlign: 'center',
//       marginBottom: '24px'
//     },
//     form: {
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '24px'
//     },
//     formGroup: {
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '8px'
//     },
//     label: {
//       fontSize: '14px',
//       fontWeight: 500,
//       color: '#333',
//       marginLeft: '4px' // Adding left margin to align with input padding
//     },
//     input: {
//       width: '100%',
//       boxSizing: 'border-box', // Ensures padding doesn't affect overall width
//       padding: '12px 16px',
//       borderRadius: '8px',
//       border: '1px solid #ddd',
//       fontSize: '16px',
//       transition: 'all 0.2s ease',
//       outline: 'none'
//     },
//     focusedInput: {
//       borderColor: '#4a56e2',
//       boxShadow: '0 0 0 3px rgba(74, 86, 226, 0.15)'
//     },
//     button: {
//       backgroundColor: '#4a56e2',
//       color: 'white',
//       fontSize: '16px',
//       fontWeight: 500,
//       padding: '14px',
//       border: 'none',
//       borderRadius: '8px',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease'
//     },
//     termsText: {
//       fontSize: '12px',
//       color: '#777',
//       textAlign: 'center',
//       marginTop: '16px'
//     }
//   };
  
//   // Focus state handlers
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [roomFocused, setRoomFocused] = useState(false);
  
//   return (
//     <div style={styles.container}>
//       <div style={styles.card}>
//         <h1 className="text-3xl">Join a Meeting</h1>
        
//         <form onSubmit={handleSubmitForm} style={styles.form}>
//           <div style={styles.formGroup}>
//             <label htmlFor="email" style={styles.label}>
//               Email Address
//             </label>
//             <input
//               type="email"
//               id="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               style={{
//                 ...styles.input,
//                 ...(emailFocused ? styles.focusedInput : {})
//               }}
//               onFocus={() => setEmailFocused(true)}
//               onBlur={() => setEmailFocused(false)}
//               required
//             />
//           </div>
          
//           <div style={styles.formGroup}>
//             <label htmlFor="room" style={styles.label}>
//               Room Code
//             </label>
//             <input
//               type="text"
//               id="room"
//               placeholder="Enter room code"
//               value={room}
//               onChange={(e) => setRoom(e.target.value)}
//               style={{
//                 ...styles.input,
//                 ...(roomFocused ? styles.focusedInput : {})
//               }}
//               onFocus={() => setRoomFocused(true)}
//               onBlur={() => setRoomFocused(false)}
//               required
//             />
//           </div>
          
//           <button
//             type="submit"
//             style={styles.button}
//             onMouseOver={(e) => {
//               e.target.style.backgroundColor = '#3a46d2';
//               e.target.style.transform = 'translateY(-2px)';
//             }}
//             onMouseOut={(e) => {
//               e.target.style.backgroundColor = '#4a56e2';
//               e.target.style.transform = 'translateY(0)';
//             }}
//           >
//             Join Room
//           </button>
          
//           <p style={styles.termsText}>
//             By joining, you agree to our Terms of Service and Privacy Policy.
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LobbyScreen;