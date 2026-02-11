import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from "lucide-react";

export const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [isCalling, setIsCalling] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  // Peer connections (mock)
  const pc1 = useRef<RTCPeerConnection | null>(null);
  const pc2 = useRef<RTCPeerConnection | null>(null);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const remote = new MediaStream();
      setRemoteStream(remote);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
      }

      pc1.current = new RTCPeerConnection();
      pc2.current = new RTCPeerConnection();

      // Send local tracks to pc1
      stream.getTracks().forEach((track) => {
        pc1.current?.addTrack(track, stream);
      });

      // Receive remote tracks in pc2
      pc2.current.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      };

      // ICE exchange
      pc1.current.onicecandidate = (event) => {
        if (event.candidate) pc2.current?.addIceCandidate(event.candidate);
      };

      pc2.current.onicecandidate = (event) => {
        if (event.candidate) pc1.current?.addIceCandidate(event.candidate);
      };

      // Offer/Answer
      const offer = await pc1.current.createOffer();
      await pc1.current.setLocalDescription(offer);
      await pc2.current.setRemoteDescription(offer);

      const answer = await pc2.current.createAnswer();
      await pc2.current.setLocalDescription(answer);
      await pc1.current.setRemoteDescription(answer);

      setIsCalling(true);
    } catch (error) {
      console.log(error);
      alert("Camera/Microphone permission denied!");
    }
  };

  const endCall = () => {
    pc1.current?.close();
    pc2.current?.close();

    pc1.current = null;
    pc2.current = null;

    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());

    setLocalStream(null);
    setRemoteStream(null);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setIsCalling(false);
    setIsMicOn(true);
    setIsCamOn(true);
  };

  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    });
  };

  const toggleCam = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCamOn(track.enabled);
    });
  };

  const shareScreen = async () => {
    if (!localStream || !pc1.current) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      const sender = pc1.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      screenTrack.onended = () => {
        const camTrack = localStream.getVideoTracks()[0];
        if (sender) sender.replaceTrack(camTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      };
    } catch (error) {
      console.log(error);
      alert("Screen share cancelled.");
    }
  };

  useEffect(() => {
    return () => {
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Video Call (WebRTC Mock)
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="relative rounded-xl overflow-hidden border bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[300px] object-cover"
          />

          <span className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-md text-sm">
            You
          </span>
        </div>

        {/* Remote Video */}
        <div className="relative rounded-xl overflow-hidden border bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-[300px] object-cover"
          />

          <span className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded-md text-sm">
            Investor / Entrepreneur
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {!isCalling ? (
          <Button onClick={startCall} className="px-6">
            Start Call
          </Button>
        ) : (
          <Button
            variant="error"
            onClick={endCall}
            leftIcon={<PhoneOff size={18} />}
            className="px-6"
          >
            End Call
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={toggleMic}
          leftIcon={isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
          disabled={!isCalling}
        >
          {isMicOn ? "Mic On" : "Mic Off"}
        </Button>

        <Button
          variant="secondary"
          onClick={toggleCam}
          leftIcon={isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
          disabled={!isCalling}
        >
          {isCamOn ? "Camera On" : "Camera Off"}
        </Button>

        <Button
          variant="accent"
          onClick={shareScreen}
          leftIcon={<MonitorUp size={18} />}
          disabled={!isCalling}
        >
          Share Screen
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;
