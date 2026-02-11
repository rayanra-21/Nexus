import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Video, Mic, MicOff, Monitor, X } from 'lucide-react';

export const VideoCallUI: React.FC<{ onEndCall: () => void }> = ({ onEndCall }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [callStarted, setCallStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Get access to webcam and microphone
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Error accessing media devices:", err));

    return () => {
      // Cleanup
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleAudio = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setVideoEnabled(!videoEnabled);
  };

  const startScreenShare = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setScreenSharing(true);

      // Stop sharing when track ends
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
        setScreenSharing(false);
      });
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const startCall = () => setCallStarted(true);
  const endCall = () => {
    setCallStarted(false);
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        {/* Videos */}
        <div className="flex flex-wrap justify-center bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-48 h-36 bg-black m-2 rounded-md"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-48 h-36 bg-black m-2 rounded-md"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 p-4 bg-gray-800">
          {!callStarted && (
            <Button onClick={startCall} variant="primary">Start Call</Button>
          )}
          {callStarted && (
            <>
              <Button onClick={toggleAudio} variant="ghost">
                {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
              </Button>
              <Button onClick={toggleVideo} variant="ghost">
                <Video size={18} />
              </Button>
              <Button onClick={startScreenShare} variant="ghost">
                <Monitor size={18} />
              </Button>
             <Button
  onClick={endCall}
  variant="ghost"
  className="bg-red-600 hover:bg-red-700 text-white"
>
  <X size={18} />
</Button>

            </>
          )}
        </div>
      </div>
    </div>
  );
};
