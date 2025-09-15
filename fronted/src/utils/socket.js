import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    auth: { token }
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not connected');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId) => {
  getSocket().emit('join-room', roomId);
};

export const leaveRoom = (roomId) => {
  getSocket().emit('leave-room', roomId);
};

export const sendOffer = (target, offer) => {
  getSocket().emit('offer', { target, offer });
};

export const sendAnswer = (target, answer) => {
  getSocket().emit('answer', { target, answer });
};

export const sendIceCandidate = (target, candidate) => {
  getSocket().emit('ice-candidate', { target, candidate });
};

export const sendDraw = (data) => {
  getSocket().emit('draw', data);
};

export const sendClearWhiteboard = () => {
  getSocket().emit('clear-whiteboard');
};

export const startScreenShare = () => {
  getSocket().emit('start-screen-share');
};

export const stopScreenShare = () => {
  getSocket().emit('stop-screen-share');
};

export const sendFileShared = (fileData) => {
  getSocket().emit('file-shared', fileData);
};

// Event listeners
export const onUserJoined = (callback) => {
  getSocket().on('user-joined', callback);
};

export const onUserLeft = (callback) => {
  getSocket().on('user-left', callback);
};

export const onOffer = (callback) => {
  getSocket().on('offer', callback);
};

export const onAnswer = (callback) => {
  getSocket().on('answer', callback);
};

export const onIceCandidate = (callback) => {
  getSocket().on('ice-candidate', callback);
};

export const onDraw = (callback) => {
  getSocket().on('draw', callback);
};

export const onClearWhiteboard = (callback) => {
  getSocket().on('clear-whiteboard', callback);
};

export const onFileShared = (callback) => {
  getSocket().on('file-shared', callback);
};

export const onScreenSharing = (callback) => {
  getSocket().on('user-screen-sharing', callback);
};

export const removeAllListeners = () => {
  if (socket) {
    socket.removeAllListeners();
  }
};
