import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserStatusProvider } from './contexts/UserStatusContext';
import { useLoading } from './contexts/LoadingContext'; // Double-check this folder path matches yours!
import { bindInterceptorsToLoader } from './services/api'; // Double-check this folder path matches your api.js!
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

function App() {
  const { showLoader, hideLoader } = useLoading();

  useEffect(() => {
    // This ties your Axios requests directly to the global loading overlay
    bindInterceptorsToLoader(showLoader, hideLoader);
  }, [showLoader, hideLoader]);

  return (
    <Router>
      <AuthProvider>
        <UserStatusProvider> 
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </UserStatusProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;