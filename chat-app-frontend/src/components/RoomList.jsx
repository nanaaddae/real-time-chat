import React, { useState, useEffect } from 'react';
import { chatRoomService } from '../services/chatRoomService';
import { Plus, LogOut, User, Users, Hash, Trash2, Search,Lock } from 'lucide-react'; // Added Search icon
import DeleteRoomModal from './DeleteRoomModal';
import './RoomList.css';
import PasswordPromptModal from './PasswordPromptModal';
const RoomList = ({ selectedRoom, onRoomSelect, onCreateRoom, onLogout, user }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomToDelete, setRoomToDelete] = useState(null);
  
  // 1. New Search State
  const [searchTerm, setSearchTerm] = useState('');

  const [roomNeedingPassword, setRoomNeedingPassword] = useState(null);
const [unlockedRooms, setUnlockedRooms] = useState(() => {
  // Load unlocked rooms from localStorage
  const stored = localStorage.getItem('unlockedRooms');
  return stored ? JSON.parse(stored) : [];
});

  // 2. Modified LoadRooms to accept a query
  const loadRooms = async (query = '') => {
    try {
      setLoading(true);
      let data;
      if (query) {
        data = await chatRoomService.searchRooms(query);
      } else {
        data = await chatRoomService.getAllRooms();
      }
      setRooms(data);
    } catch (err) {
      setError('Failed to load rooms');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Debounce Effect: Wait for user to stop typing before searching
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadRooms(searchTerm);
    }, 400); // 400ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

 const handleJoinRoom = async (room) => {

  try {
    // Check if room is private and user is not a member
    const isPrivate = room.type === 'PRIVATE';
    const isMember = room.memberUsernames?.includes(user.username);
    const hasUnlocked = unlockedRooms.includes(room.id);


    if (isPrivate && room.hasPassword && !isMember && !hasUnlocked) {
      // Show password prompt
      setRoomNeedingPassword(room);
      return;
    }
    // If already member or public room, join directly
    if (!isMember) {
      await chatRoomService.joinRoom(room.id);
      await loadRooms();
    }
    onRoomSelect(room);
  } catch (err) {
    console.error('Error joining room:', err);
    alert('Failed to join room');
  } 
};
  const handlePasswordSubmit = async (password) => {
  await chatRoomService.joinRoom(roomNeedingPassword.id, password);
  
  // Remember this room is unlocked
  const newUnlocked = [...unlockedRooms, roomNeedingPassword.id];
  setUnlockedRooms(newUnlocked);
  localStorage.setItem('unlockedRooms', JSON.stringify(newUnlocked));
  
  await loadRooms();
  onRoomSelect(roomNeedingPassword);
  setRoomNeedingPassword(null);
  // If there's an error, it will bubble up to PasswordPromptModal's catch block
};


  

  const handleDeleteRoom = async (room) => {
    try {
      await chatRoomService.deleteRoom(room.id);
      setRoomToDelete(null);
      await loadRooms(searchTerm);
      if (selectedRoom?.id === room.id) {
        onRoomSelect(null);
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Failed to delete room. You must be the room creator.');
    }
  };

   

  return (
    <div className="room-list">
      <div className="room-list-header">
        <div className="user-info">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <div className="user-name">{user?.displayName || user?.username}</div>
            <div className="user-status">
              <span className="status-indicator online"></span>
              Online
            </div>
          </div>
        </div>
        
        <button onClick={onLogout} className="btn-icon" title="Logout">
          <LogOut size={20} />
        </button>
      </div>

      <div className="room-list-actions">
        {/* 4. New Search Input UI */}

        <button onClick={onCreateRoom} className="btn btn-primary btn-full">
          <Plus size={18} />
          Create Room
        </button>
      </div>

      <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="room-search-input"
          />
        </div>

      <div className="rooms-section">
        <div className="section-header">
          <Users size={18} />
          <span>Chat Rooms</span>
        </div>

        {loading ? (
          <div className="room-list-loading">Loading rooms...</div>
        ) : error ? (
          <div className="room-list-error">{error}</div>
        ) : rooms.length === 0 ? (
          <div className="room-list-empty">
            {searchTerm ? 'No rooms match your search.' : 'No rooms available. Create one!'}
          </div>
        ) : (
          <div className="rooms-list">
            {rooms.map((room) => (
              <div key={room.id} className="room-item-container">
                <div
                  className={`room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                  onClick={() => handleJoinRoom(room)}
                >
                  <div className="room-icon">
  {room.type === 'PRIVATE' && room.hasPassword ? (
    <Lock size={20} />
  ) : (
    <Hash size={20} />
  )}
</div>

                  <div className="room-details">
                    <div className="room-name">{room.name}</div>
                    <div className="room-info">
                      {room.memberUsernames?.length || 0} members
                      {room.description && ` • ${room.description.substring(0, 30)}...`}
                    </div>
                  </div>
                  {room.memberUsernames?.includes(user.username) && (
                    <div className="joined-badge">Joined</div>
                  )}
                </div>
                {room.creatorUsername === user.username && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoomToDelete(room);
                    }}
                    className="delete-room-btn"
                    title="Delete room"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {roomToDelete && (
        <DeleteRoomModal
          room={roomToDelete}
          onClose={() => setRoomToDelete(null)}
          onConfirm={() => handleDeleteRoom(roomToDelete)}
        />
      )}

      {roomNeedingPassword && (
        <PasswordPromptModal
          room={roomNeedingPassword}
          onClose={() => setRoomNeedingPassword(null)}
           onSubmit={handlePasswordSubmit}  
        />
      )}

    </div>
  );

  
};

export default RoomList;