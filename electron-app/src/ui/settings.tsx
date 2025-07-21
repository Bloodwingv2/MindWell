import React, { useState } from 'react';
import './settings.css';

const Settings: React.FC = () => {
  const [userName, setUserName] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleSave = () => {
    // Save the user's name
    console.log('User name saved:', userName);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your application settings.</p>
      </div>
      <div className="settings-content">
        <div className="setting-item">
          <label htmlFor="userName">Your Name</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={handleNameChange}
            placeholder="Enter your name"
          />
        </div>
        <div className="setting-item">
          <button onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
