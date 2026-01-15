import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoomList from '../components/RoomList';
import ChatWindow from '../components/ChatWindow';
import CreateRoomModal from '../components/CreateRoomModal';
import websocketService from '../services/websocketService';
import './Chat.css';

const Chat = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  // Connect to WebSocket on mount
  websocketService.connect(
    () => {
      setWsConnected(true);
    },
    (error) => {
      console.error('WebSocket connection error:', error);
      setWsConnected(false);
    }
  );

    // Cleanup on unmount
    return () => {
      websocketService.unsubscribeFromUserStatus();
      websocketService.disconnect();
    };
  }, []);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleLogout = () => {
    websocketService.disconnect();
    logout();
    navigate('/login');
  };

  return (
    <div className="chat-container">
      <RoomList
        selectedRoom={selectedRoom}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={() => setShowCreateModal(true)}
        onLogout={handleLogout}
        user={user}
      />
      
      <ChatWindow 
        room={selectedRoom} 
        wsConnected={wsConnected}
      />

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={(room) => {
            setShowCreateModal(false);
            setSelectedRoom(room);
          }}
        />
      )}
    </div>
  );
};

export default Chat;