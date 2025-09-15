import React, { useState, useEffect } from 'react';
import VideoCall from './VideoCall';
import Whiteboard from './Whiteboard';
import FileShare from './FileShare';
import UserList from './UserList';
import { connectSocket, disconnectSocket, joinRoom, removeAllListeners } from '../utils/socket';

const Dashboard = ({ user, onLogout }) => {
  const [currentRoom, setCurrentRoom] = useState('default-room');
  const [localStream, setLocalStream] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Connect socket
    const token = localStorage.getItem('token');
    const socket = connectSocket(token);

    // Get local media stream
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getMediaStream();

    // Setup socket listeners
    socket.on('user-joined', (data) => {
      setUsers(data.users);
    });

    socket.on('user-left', (data) => {
      setUsers(data.users);
    });

    // Join room
    joinRoom(currentRoom);

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      removeAllListeners();
      disconnectSocket();
    };
  }, [currentRoom]);

  const handleLogout = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    onLogout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'video':
        return <VideoCall roomId={currentRoom} localStream={localStream} />;
      case 'whiteboard':
        return <Whiteboard roomId={currentRoom} />;
      case 'files':
        return <FileShare roomId={currentRoom} />;
      default:
        return <VideoCall roomId={currentRoom} localStream={localStream} />;
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Collaboration Room: {currentRoom}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px' }}>
        {/* Sidebar */}
        <div>
          <UserList users={users} currentUser={user} />
          
          <div className="card">
            <h3>Navigation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className={`btn ${activeTab === 'video' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('video')}
              >
                Video Call
              </button>
              <button
                className={`btn ${activeTab === 'whiteboard' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('whiteboard')}
              >
                Whiteboard
              </button>
              <button
                className={`btn ${activeTab === 'files' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('files')}
              >
                File Sharing
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
