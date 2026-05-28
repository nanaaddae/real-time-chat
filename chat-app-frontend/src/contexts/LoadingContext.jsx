import React, { createContext, useState, useContext } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showLoader = (msg = 'Waking up backend server, please wait...') => {
    setLoadingMessage(msg);
    setIsLoading(true);
  };

  const hideLoader = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      {isLoading && (
        <div className="global-loader-overlay">
          <div className="loader-box">
            <div className="spinner"></div>
            <p>{loadingMessage}</p>
            <span className="subtext">Free servers take up to 40 seconds to boot up.</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);