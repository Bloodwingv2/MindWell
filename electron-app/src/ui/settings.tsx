import React, { useState, useEffect } from 'react';
import './settings.css';

interface SettingsProps {
  userName: string;
  setUserName: (name: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ userName, setUserName }) => {
  const [localUserName, setLocalUserName] = useState(userName);
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    newMemory: true,
    moodSummary: true,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUserName(e.target.value);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSave = () => {
    setUserName(localUserName);
    localStorage.setItem('userName', localUserName);
    console.log('Settings saved:', { userName: localUserName, theme, language, notifications });
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
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="toggle-switch">
              <label>Dark Mode</label>
              <label className="switch">
                <input type="checkbox" checked={theme === 'dark'} onChange={handleThemeChange} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>Language</h3>
          <div className="setting-item">
            <label htmlFor="language">Select Language</label>
            <select id="language" value={language} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>

        <div className="settings-card">
          <h3>Notifications</h3>
          <div className="setting-item">
            <div className="toggle-switch">
              <label>New Memory Alerts</label>
              <label className="switch">
                <input
                  type="checkbox"
                  name="newMemory"
                  checked={notifications.newMemory}
                  onChange={handleNotificationChange}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          <div className="setting-item">
            <div className="toggle-switch">
              <label>Mood Summaries</label>
              <label className="switch">
                <input
                  type="checkbox"
                  name="moodSummary"
                  checked={notifications.moodSummary}
                  onChange={handleNotificationChange}
                />
                <span className="slider"></span>
              </label>
            </div>
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
