import React, { useState, useEffect } from 'react';
import './settings.css';
import portData from '../Binaries/server_config.json'; // Import port from JSON file


const serverPort = portData.port;

interface SettingsProps {
  userName: string;
  setUserName: (name: string) => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

// Add these language options at the top of the file
const LANGUAGE_OPTIONS = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'zh': 'Chinese (Simplified)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'it': 'Italian',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'tr': 'Turkish',
  'pl': 'Polish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'tl': 'Filipino (Tagalog)'
};

const Settings: React.FC<SettingsProps> = ({ userName, setUserName, showNotification }) => {
  const [localUserName, setLocalUserName] = useState(userName);
  const [defaultLanguage, setDefaultLanguage] = useState(() => 
    localStorage.getItem('defaultLanguage') || 'en'
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem('defaultLanguage') || 'en';
    // Send saved language to backend on component mount
    fetch(`http://localhost:${serverPort}/update_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ defaultlang: savedLanguage }),
    }).catch(error => {
      console.error('Error updating default language on mount:', error);
    });
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUserName(e.target.value);
  };
  
  const handleSave = () => {
    setUserName(localUserName);
    localStorage.setItem('userName', localUserName);
    console.log('Settings saved:', { userName: localUserName});
    showNotification('Settings Saved!', 'success');
  };

  const handleExportData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${serverPort}/export_data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memory_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data.', 'error');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      try {
        const response = await fetch('http://127.0.0.1:8000/clear_data', {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        showNotification(result.message, 'success');
      } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('Failed to clear data.', 'error');
      }
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setDefaultLanguage(newLang);
    localStorage.setItem('defaultLanguage', newLang);
    
    try {
      const response = await fetch(`http://localhost:${serverPort}/update_settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ defaultlang: newLang }),
      });

      if (response.ok) {
        showNotification('Default language updated successfully', 'success');
      } else {
        throw new Error('Failed to update default language');
      }
    } catch (error) {
      showNotification('Failed to update default language', 'error');
    }
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
          <h3>Default Language</h3>
          <div className="setting-item">
            <select 
              value={defaultLanguage}
              onChange={handleLanguageChange}
              className="language-dropdown"
            >
              {Object.entries(LANGUAGE_OPTIONS).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
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
