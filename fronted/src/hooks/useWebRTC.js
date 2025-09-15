import { useState, useEffect, useRef } from 'react';

const useWebRTC = (roomId, localStream) => {
  const [peers, setPeers] = useState({});
  const peersRef = useRef({});
  const socketRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!localStream) return;

    const setupPeerConnection = (userId) => {
      const pc = new RTCPeerConnection(configuration);

      // Add local stream tracks
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('ice-candidate', {
            target: userId,
            candidate: event.candidate
          });
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setPeers(prev => ({
          ...prev,
          [userId]: { pc, stream: remoteStream }
        }));
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${userId}:`, pc.connectionState);
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          cleanupPeer(userId);
        }
      };

      return pc;
    };

    const cleanupPeer = (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
    };

    // Setup socket event listeners
    const setupSocketListeners = () => {
      socketRef.current.on('offer', async ({ offer, sender }) => {
        if (sender in peersRef.current) return;

        const pc = setupPeerConnection(sender);
        peersRef.current[sender] = pc;

        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit('answer', {
          target: sender,
          answer: pc.localDescription
        });
      });

      socketRef.current.on('answer', async ({ answer, sender }) => {
        const pc = peersRef.current[sender];
        if (pc) {
          await pc.setRemoteDescription(answer);
        }
      });

      socketRef.current.on('ice-candidate', async ({ candidate, sender }) => {
        const pc = peersRef.current[sender];
        if (pc && candidate) {
          await pc.addIceCandidate(candidate);
        }
      });

      socketRef.current.on('user-left', ({ userId }) => {
        cleanupPeer(userId);
      });
    };

    // Create offers for all users when joining
    const createOffers = async (users) => {
      for (const userId of users) {
        if (userId === socketRef.current.userId) continue;

        const pc = setupPeerConnection(userId);
        peersRef.current[userId] = pc;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('offer', {
          target: userId,
          offer: pc.localDescription
        });
      }
    };

    return () => {
      // Cleanup all peer connections
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      setPeers({});
    };
  }, [localStream, roomId]);

  return { peers };
};

export default useWebRTC;
