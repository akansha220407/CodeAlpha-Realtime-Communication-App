const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const { verifyTokenSocket } = require('./middleware/authMiddleware');
const { handleSocketConnection } = require('./utils/socketHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK' }));

io.use((socket, next) => verifyTokenSocket(socket, next));
handleSocketConnection(io);

const PORT = config.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
