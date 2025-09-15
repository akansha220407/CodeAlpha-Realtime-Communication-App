const rooms = new Map();

exports.handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('User  connected:', socket.userId);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      if (!rooms.has(roomId)) rooms.set(roomId, new Set());
      rooms.get(roomId).add(socket.userId);

      socket.to(roomId).emit('user-joined', { userId: socket.userId, users: Array.from(rooms.get(roomId)) });

      socket.on('offer', (data) => {
        socket.to(data.target).emit('offer', { offer: data.offer, sender: socket.userId });
      });

      socket.on('answer', (data) => {
        socket.to(data.target).emit('answer', { answer: data.answer, sender: socket.userId });
      });

      socket.on('ice-candidate', (data) => {
        socket.to(data.target).emit('ice-candidate', { candidate: data.candidate, sender: socket.userId });
      });

      socket.on('draw', (data) => {
        socket.to(roomId).emit('draw', { ...data, userId: socket.userId });
      });

      socket.on('clear-whiteboard', () => {
        socket.to(roomId).emit('clear-whiteboard', { userId: socket.userId });
      });

      socket.on('file-shared', (data) => {
        socket.to(roomId).emit('file-shared', { ...data, userId: socket.userId });
      });

      socket.on('start-screen-share', () => {
        socket.to(roomId).emit('user-screen-sharing', { userId: socket.userId, sharing: true });
      });

      socket.on('stop-screen-share', () => {
        socket.to(roomId).emit('user-screen-sharing', { userId: socket.userId, sharing: false });
      });
    });

    socket.on('disconnect', () => {
      rooms.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(roomId).emit('user-left', { userId: socket.userId, users: Array.from(users) });
        }
      });
      console.log('User  disconnected:', socket.userId);
    });
  });
};
