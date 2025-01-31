import React, { useEffect, useState } from "react";
import peer from "../utilities/RTCpeerUtilities/peer";
type StreamType = "audio" | "video" | null;

export default function useRTCMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [type, setType] = useState<StreamType>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (type) {
      navigator.mediaDevices.getUserMedia({ video: type === "video" ? true : false, audio: true }).then((stream) => {
        setLocalStream(stream);
      });
    }
  }, [type]);

  const sendStream = () => {
    if (localStream)
      localStream.getTracks().forEach((track) => {
        if (!peer.peer) return;
        peer.peer.addTrack(track, localStream);
      });
  };

  const handleTrackReceived = (event: RTCTrackEvent) => {
    setStream(event.streams[0]);
  };

  const stopStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop(); // Stop each track (audio/video)
      });
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop(); // Stop each track (audio/video)
      });
    }
  };

  useEffect(() => {
    if (peer.peer) {
      peer.peer.addEventListener("track", handleTrackReceived);
    }
    return () => {
      if (peer.peer) {
        peer.peer.removeEventListener("track", handleTrackReceived);
      }
    };
  }, [peer.peer, type]);

  return [
    { setType, localStream, remoteStream: stream },
    { sendStream, stopStream },
  ];
}
