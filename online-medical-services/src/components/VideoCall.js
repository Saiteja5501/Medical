import React, { useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);

  /* ================= CLEANUP ================= */

  const cleanupCall = useCallback(() => {
    // Stop camera & mic
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    socket.off("offer");
    socket.off("answer");
    socket.off("ice-candidate");
    socket.off("end-call");
  }, []);

  /* ================= REMOTE END ================= */

  const handleRemoteEndCall = useCallback(() => {
    cleanupCall();
    alert("The other user ended the call");
    navigate(-1);
  }, [cleanupCall, navigate]);

  /* ================= START CALL ================= */

  useEffect(() => {
    const startCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      localVideo.current.srcObject = stream;

      peerRef.current = new RTCPeerConnection();

      stream.getTracks().forEach(track =>
        peerRef.current.addTrack(track, stream)
      );

      peerRef.current.ontrack = (event) => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate
          });
        }
      };

      socket.emit("join-room", roomId);

      socket.on("offer", async (offer) => {
        await peerRef.current.setRemoteDescription(offer);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      });

      socket.on("answer", (answer) => {
        peerRef.current.setRemoteDescription(answer);
      });

      socket.on("ice-candidate", (candidate) => {
        peerRef.current.addIceCandidate(candidate);
      });

      socket.on("end-call", handleRemoteEndCall);
    };

    startCall();

    return () => cleanupCall();
  }, [roomId, cleanupCall, handleRemoteEndCall]);

  /* ================= LOCAL END ================= */

  const handleEndCall = () => {
    socket.emit("end-call", roomId);
    cleanupCall();
    navigate(-1);
  };

  return (
    <div style={page}>
      <h2 style={title}>Video Consultation</h2>

      <div style={videoContainer}>
        <video ref={localVideo} autoPlay muted style={video} />
        <video ref={remoteVideo} autoPlay style={video} />
      </div>

      {/* 🔴 END CALL BUTTON */}
      <button style={endCallBtn} onClick={handleEndCall}>
        End Call
      </button>
    </div>
  );
}

export default VideoCall;

/* ================= STYLES ================= */

const page = {
  padding: "20px",
  textAlign: "center"
};

const title = {
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "20px"
};

const videoContainer = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
  marginBottom: "30px"
};

const video = {
  width: "45%",
  borderRadius: "12px",
  background: "#000"
};

const endCallBtn = {
  padding: "14px 28px",
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer"
};
