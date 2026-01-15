import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messageService } from '../services/messageService';
import websocketService from '../services/websocketService';
import { Send, Hash, Loader, Trash2 } from 'lucide-react';
import './ChatWindow.css';
import UserStatusTooltip from './UserStatusTooltip';

const ChatWindow = ({ room, wsConnected }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    if (room) {
      loadMessages();
      subscribeToRoom();
    }

    return () => {
      if (room) {
        websocketService.unsubscribeFromRoom(room.id);
        websocketService.unsubscribeFromTyping(room.id);
        websocketService.unsubscribeFromMessageDeletion(room.id);
      }
    };
  }, [room, wsConnected]); // Added wsConnected to trigger subscription if connection drops/returns

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const roomMessages = await messageService.getRoomMessages(room.id, 50);
      // Backend usually sends newest first for pagination, reverse for chat view
      setMessages(roomMessages.reverse());
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRoom = () => {
    if (!wsConnected) return;

    websocketService.subscribeToRoom(room.id, (message) => {
      if (message.type === 'CHAT') {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      } else if (message.type === 'JOIN' || message.type === 'LEAVE') {
        const action = message.type === 'JOIN' ? 'joined' : 'left';
        setMessages((prev) => [
          ...prev,
          { ...message, content: `${message.senderUsername} ${action} the room` },
        ]);
      }
    });

    websocketService.subscribeToMessageDeletion(room.id, (deletionNotification) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === deletionNotification.id
            ? { ...msg, deleted: true } // Just mark as deleted, UI handles the text
            : msg
        )
      );
    });

    websocketService.subscribeToTyping(room.id, (notification) => {
      if (notification.senderUsername !== user.username) {
        setTypingUsers((prev) => new Set(prev).add(notification.senderUsername));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(notification.senderUsername);
            return newSet;
          });
        }, 3000);
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsConnected) return;

    const message = {
      content: newMessage,
      type: 'CHAT',
      chatRoomId: room.id,
    };

    websocketService.sendMessage(room.id, message);
    setNewMessage('');
  };

  const handleTyping = () => {
    if (!wsConnected) return;
    websocketService.sendTypingNotification(room.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleDeleteMessage = (messageId) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    websocketService.deleteMessage(room.id, messageId);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!room) {
    return (
      <div className="chat-window-empty">
        <Hash size={64} className="empty-icon" />
        <h2>Welcome to Chat</h2>
        <p>Select a room from the sidebar to start chatting</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-room-info">
          <Hash size={20} />
          <div>
            <div className="chat-room-name">{room.name}</div>
            {room.description && <div className="chat-room-description">{room.description}</div>}
          </div>
        </div>
        {!wsConnected && (
          <div className="connection-status">
            <Loader size={16} className="spinning" />
            Connecting...
          </div>
        )}
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="messages-loading">
            <Loader size={32} className="spinning" />
            Loading messages...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`message ${
                msg.type !== 'CHAT' ? 'system-message' :
                msg.senderUsername === user.username ? 'own-message' : ''
              }`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              {msg.type === 'CHAT' ? (
                <>
                  <div className="message-avatar">
                    {(msg.senderDisplayName?.[0] || msg.senderUsername[0]).toUpperCase()}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                     <UserStatusTooltip username={msg.senderUsername}>
                      <span className="message-sender">
                        {msg.senderDisplayName || msg.senderUsername}
                      </span>
                      </UserStatusTooltip>
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                      {/* Delete Button - Only show if own message AND not already deleted */}
                      {msg.senderUsername === user.username && !msg.deleted && hoveredMessageId === msg.id && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="delete-message-btn"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Persisted Delete Check */}
                    <div className={`message-text ${msg.deleted ? 'deleted' : ''}`}>
                      {msg.deleted ? (
                        <span className="deleted-placeholder">This message has been deleted</span>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="system-message-text">{msg.content}</div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.size > 0 && (
        <div className="typing-indicator">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleTyping} // Changed to onKeyDown for better responsiveness
          placeholder={`Message #${room.name}`}
          className="chat-input"
          disabled={!wsConnected}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!newMessage.trim() || !wsConnected}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;