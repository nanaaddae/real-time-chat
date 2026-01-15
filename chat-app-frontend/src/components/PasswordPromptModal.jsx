import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import './PasswordPromptModal.css';

const PasswordPromptModal = ({ room, onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(password);
      onClose();
    } catch (err) {
      console.error('Password submit error:', err);
    console.error('Error response:', err.response);
      setError(err.response?.data || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="password-header">
            <Lock size={24} color="var(--primary)" />
            <h2>Enter Password</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <p className="password-description">
            This room is private. Enter the password to join <strong>#{room.name}</strong>
          </p>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter room password"
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !password}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordPromptModal;