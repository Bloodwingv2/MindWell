import React, { useState, useEffect } from 'react';
import './settings.css';

interface SettingsProps {
  userName: string;
  setUserName: (name: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ userName, setUserName }) => {
  const [localUserName, setLocalUserName] = useState(userName);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUserName(e.target.value);
  };
  
  const handleSave = () => {
    setUserName(localUserName);
    localStorage.setItem('userName', localUserName);
    console.log('Settings saved:', { userName: localUserName});
    alert('Settings Saved!');
  };

  const handleExportData = () => {
    console.log('Exporting data...');
  };

  const handleClearData = () => {
    console.log('Clearing data...');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your MindWell experience.</p>
      </div>
      <div className="settings-grid">
        <div className="settings-card">
          <h3>Profile</h3>
          <div className="setting-item">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={localUserName}
              onChange={handleNameChange}
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>Data Management</h3>
          <div className="setting-item">
            <button className="btn btn-secondary" onClick={handleExportData}>Export My Data</button>
          </div>
          <div className="setting-item">
            <button className="btn btn-danger" onClick={handleClearData}>Clear All Data</button>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="btn btn-primary" onClick={handleSave}>Save All Settings</button>
      </div>
    </div>
  );
};

export default Settings;
