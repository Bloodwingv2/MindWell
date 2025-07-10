import './GratitudeJournal.css';
import React, { useState } from 'react';

interface GratitudeJournalProps {
  gratitudeEntries: { id: string; date: string; text: string }[];
  setGratitudeEntries: React.Dispatch<React.SetStateAction<{ id: string; date: string; text: string }[]>>;
}

const GratitudeJournal: React.FC<GratitudeJournalProps> = ({ gratitudeEntries, setGratitudeEntries }) => {
  const [newEntryText, setNewEntryText] = useState('');

  const handleSaveGratitude = () => {
    const entryText = newEntryText.trim();
    if (entryText) {
      const newEntry = { id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), text: entryText };
      setGratitudeEntries(prev => [...prev, newEntry]);
      setNewEntryText('');
    }
  };

  return (
    <div className="gratitude-journal-container">
      <div className="journal-cover">
        <h1>My Gratitude Journal</h1>
      </div>
      <div className="journal-binding"></div>
      <div className="journal-pages">
        <div className="journal-page current-page">
          <div className="page-header">
            <h2>Today's Gratitude</h2>
            <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <textarea
            id="gratitudeEntry"
            className="gratitude-textarea"
            placeholder="Today I am grateful for..."
            value={newEntryText}
            onChange={(e) => setNewEntryText(e.target.value)}
          ></textarea>
          <button id="saveGratitudeBtn" className="gratitude-save-button" onClick={handleSaveGratitude}>
            Save Entry
          </button>
        </div>

        <div className="journal-page past-entries-page">
          <div className="page-header">
            <h2>Past Entries</h2>
          </div>
          <ul id="gratitudeList" className="gratitude-list-styles">
            {gratitudeEntries.length > 0 ? (
              gratitudeEntries.map(entry => (
                <li key={entry.id} className="gratitude-item-styles">
                  <span className="entry-date">{entry.date}:</span> {entry.text}
                </li>
              ))
            ) : (
              <li className="no-entries">No past entries yet. Start writing!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GratitudeJournal;
