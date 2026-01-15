import React, { createContext, useContext, useState, useEffect } from 'react';
import websocketService from '../services/websocketService';

export const UserStatusContext = createContext(null);

export const UserStatusProvider = ({ children }) => {
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    let subscription = null;
    let intervalId = null;

    const startSubscription = () => {
      // If the service is connected, subscribe
      if (websocketService.isConnected()) {
        subscription = websocketService.subscribeToUserStatus((statusUpdate) => {
          if (statusUpdate && statusUpdate.username) {
            setUserStatuses((prev) => ({
              ...prev,
              [statusUpdate.username]: statusUpdate.status
            }));
          }
        });
        if (intervalId) clearInterval(intervalId);
      }
    };

    // 1. Try to subscribe immediately
    startSubscription();

    // 2. If it failed (not connected yet), check every 2 seconds
    intervalId = setInterval(() => {
      if (!subscription) {
        startSubscription();
      }
    }, 2000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const getUserStatus = (username) => userStatuses[username] || null;

  const setUserStatus = (username, status) => {
    setUserStatuses((prev) => ({ ...prev, [username]: status }));
  };

  // CRITICAL: Ensure {children} is outside of any logic gates
  return (
    <UserStatusContext.Provider value={{ userStatuses, getUserStatus, setUserStatus }}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatus must be used within UserStatusProvider');
  }
  return context;
};