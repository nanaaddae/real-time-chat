// Create new file: src/components/DeleteRoomModal.jsx

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './DeleteRoomModal.css';

const DeleteRoomModal = ({ room, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== room.name) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="delete-warning">
            <AlertTriangle size={24} color="var(--error)" />
            <h2>Delete Room</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="warning-text">
            This will permanently delete <strong>#{room.name}</strong> and all its messages.
            This action cannot be undone.
          </p>

          <div className="form-group">
            <label>Type the room name to confirm:</label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input"
              placeholder={room.name}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            disabled={confirmText !== room.name || loading}
          >
            {loading ? 'Deleting...' : 'Delete Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomModal;