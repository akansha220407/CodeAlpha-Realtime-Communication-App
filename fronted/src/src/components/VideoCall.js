import React, { useEffect, useRef } from 'react';
import useWebRTC from '../hooks/useWebRTC';

const VideoCall = ({ roomId, localStream }) => {
  const localVideoRef = useRef();
  const { peers } = useWebRTC(roomId, localStream);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="card">
      <h2>Video Call</h2>
      <div className="video-grid">
        {/* Local video */}
        <div className="video-container">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-overlay">You</div>
        </div>

        {/* Remote videos */}
        {Object.entries(peers).map(([userId, peer]) => (
          <div key={userId} className="video-container">
            <video
              ref={videoEl => {
                if (videoEl && peer.stream) {
                  videoEl.srcObject = peer.stream;
                }
              }}
              autoPlay
              playsInline
            />
            <div className="video-overlay">User {userId.slice(0, 8)}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary">
          Share Screen
        </button>
        <button className="btn btn-secondary">
          Mute Audio
        </button>
        <button className="btn btn-secondary">
          Mute Video
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
