import React, { useState } from 'react';
import { userService } from '../services/userService';
import { useUserStatus } from '../contexts/UserStatusContext';  
import { Circle } from 'lucide-react';
import './UserStatusTooltip.css';

const UserStatusTooltip = ({ username, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 1. Get real-time status functions from your context
  const { getUserStatus } = useUserStatus();  

  const loadUserInfo = async () => {
    if (userInfo) return; // Don't reload if we already have the profile data
    
    setLoading(true);
    try {
      const data = await userService.getUserByUsername(username);
      setUserInfo(data);
      // Note: We don't call setUserStatus here anymore. 
      // We want the WebSocket to be the only source for real-time changes.
    } catch (err) {
      console.error('Error loading user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    loadUserInfo();
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  /**
   * 2. PRIORITY LOGIC:
   * We check the WebSocket Context first (getUserStatus).
   * If the context has no data for this user yet, we fall back to the DB info (userInfo.status).
   * If both are missing, we default to OFFLINE.
   */
  const contextStatus = getUserStatus(username);
  const currentStatus = contextStatus || (userInfo ? userInfo.status : 'OFFLINE');

  const getStatusColor = (status) => {

    const s = status?.toUpperCase();
    switch (s) {
      case 'ONLINE': return 'var(--success)';
      case 'AWAY': return 'var(--warning)';
      case 'BUSY': return 'var(--error)';
      case 'OFFLINE': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'AWAY': return 'Away';
      case 'BUSY': return 'Busy';
      case 'OFFLINE': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <span 
      className="user-status-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showTooltip && (
        <div className="user-status-tooltip">
          {loading ? (
            <div className="tooltip-loading">Loading...</div>
          ) : userInfo ? (
            <>
              <div className="tooltip-header">
                <div className="tooltip-avatar">
                  {(userInfo.displayName?.[0] || userInfo.username[0]).toUpperCase()}
                </div>
                <div className="tooltip-info">
                  <div className="tooltip-name">{userInfo.displayName || userInfo.username}</div>
                  <div className="tooltip-username">@{userInfo.username}</div>
                </div>
              </div>
              <div className="tooltip-status">
                <Circle 
                  size={12} 
                  fill={getStatusColor(currentStatus)} 
                  color={getStatusColor(currentStatus)} 
                />
                <span>{getStatusText(currentStatus)}</span>  
              </div>
            </>
          ) : (
            <div className="tooltip-error">Failed to load user info</div>
          )}
        </div>
      )}
    </span>
  );
};

export default UserStatusTooltip;