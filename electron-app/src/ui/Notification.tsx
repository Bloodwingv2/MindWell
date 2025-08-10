// Notification.tsx
import React, { useEffect, useState } from 'react';


interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto-hide after 4 seconds (fixed from 40000)

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for exit animation
  };

  const getIcon = () => {
    if (type === 'success') {
      return (
        <svg width="35" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    } else {
      return (
        <svg width="35" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
  };

  const getTitle = () => {
    return type === 'success' ? 'Success!' : 'Error!';
  };

  return (
    <div className={`notification ${type} ${isExiting ? 'exit' : ''}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <div className="notification-content">
        <div className="notification-title">{getTitle()}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button className="notification-close" onClick={handleClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="notification-progress"></div>
    </div>
  );
};

export default Notification;