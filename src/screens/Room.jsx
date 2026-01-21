import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/socketProvider";
import peer from "../services/peer"

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    setIsMicOn(true);
    setIsCameraOn(true);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      setIsMicOn(true);
      setIsCameraOn(true);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  const endCall = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    setIsMicOn(true);
    setIsCameraOn(true);

    if (remoteSocketId) {
      socket.emit("call:end", { to: remoteSocketId });
    }
  }, [myStream, remoteSocketId, socket]);

  const toggleMic = useCallback(() => {
    if (myStream) {
      const audioTracks = myStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  }, [myStream, isMicOn]);

  const toggleCamera = useCallback(() => {
    if (myStream) {
      const videoTracks = myStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  }, [myStream, isCameraOn]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  // Sync mic and camera state with stream tracks
  useEffect(() => {
    if (myStream) {
      const audioTracks = myStream.getAudioTracks();
      const videoTracks = myStream.getVideoTracks();
      if (audioTracks.length > 0) {
        setIsMicOn(audioTracks[0].enabled);
      }
      if (videoTracks.length > 0) {
        setIsCameraOn(videoTracks[0].enabled);
      }
    }
  }, [myStream]);

  const handleCallEnded = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    setIsMicOn(true);
    setIsCameraOn(true);
  }, [myStream]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("call:end", handleCallEnded);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("call:end", handleCallEnded);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleCallEnded,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Vartalap
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
              remoteSocketId 
                ? "bg-green-100 text-green-700 border-2 border-green-200" 
                : "bg-amber-100 text-amber-700 border-2 border-amber-200"
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${remoteSocketId ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                <span>{remoteSocketId ? "Connected" : "Waiting..."}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Video Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Remote Stream */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100 aspect-video">
              {remoteStream ? (
                <div className="relative w-full h-full">
          <ReactPlayer
            playing
                    muted={false}
                    url={remoteStream}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md z-10 border border-gray-200">
                    <p className="text-gray-800 text-sm font-semibold flex items-center space-x-2">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Remote Participant</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Waiting for participant to join...</p>
                  </div>
                </div>
              )}
            </div>

            {/* My Stream */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100 aspect-video">
              {myStream ? (
                <div className="relative w-full h-full">
          <ReactPlayer
            playing
                    muted={!isMicOn}
                    url={myStream}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md z-10 border border-gray-200">
                    <p className="text-gray-800 text-sm font-semibold flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>You</span>
                    </p>
                  </div>
                  {!isMicOn && (
                    <div className="absolute top-4 right-4 bg-red-100 border-2 border-red-200 backdrop-blur-sm px-3 py-1 rounded-lg z-10 shadow-md">
                      <p className="text-red-700 text-xs font-semibold flex items-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                        <span>Muted</span>
                      </p>
                    </div>
                  )}
                  {!isCameraOn && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">Camera is off</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Your video will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-lg px-6 py-5">
        <div className="max-w-7xl mx-auto">
          {/* Call Button */}
          {remoteSocketId && !myStream && (
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={handleCallUser}
                className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-green-500/30 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-lg">Start Call</span>
              </button>
            </div>
          )}

          {/* Status Indicator */}
          {!remoteSocketId && (
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3 bg-amber-50 border-2 border-amber-200 px-6 py-3 rounded-xl">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></div>
                <span className="text-amber-700 font-semibold text-sm">Waiting for others to join...</span>
              </div>
            </div>
          )}

          {/* Media Controls */}
          {myStream && (
            <div className="flex items-center justify-center space-x-4">
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`flex items-center justify-center w-14 h-14 rounded-full font-bold shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-200 ${
                  isMicOn
                    ? "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
                    : "bg-red-500 text-white border-2 border-red-600 hover:bg-red-600"
                }`}
                title={isMicOn ? "Mute microphone" : "Unmute microphone"}
              >
                {isMicOn ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleCamera}
                className={`flex items-center justify-center w-14 h-14 rounded-full font-bold shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-200 ${
                  isCameraOn
                    ? "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
                    : "bg-red-500 text-white border-2 border-red-600 hover:bg-red-600"
                }`}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraOn ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* End Call */}
              <button
                onClick={endCall}
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-400/40 transform hover:scale-105 active:scale-95 transition-all duration-200"
                title="End call"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}  />
                </svg>
                <span>End Call</span>
              </button>

              {/* Share Stream Button */}
              <button
                onClick={sendStreams}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Share Stream</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
