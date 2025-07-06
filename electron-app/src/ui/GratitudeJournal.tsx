import './GratitudeJournal.css';

interface GratitudeJournalProps {
  gratitudeEntries: { id: string; date: string; text: string }[];
  setGratitudeEntries: React.Dispatch<React.SetStateAction<{ id: string; date: string; text: string }[]>>;
}

const GratitudeJournal: React.FC<GratitudeJournalProps> = ({ gratitudeEntries, setGratitudeEntries }) => {
  const handleSaveGratitude = () => {
    const gratitudeEntryInput = document.getElementById('gratitudeEntry') as HTMLTextAreaElement;
    const entryText = gratitudeEntryInput.value.trim();
    if (entryText) {
      const newEntry = { id: Date.now().toString(), date: new Date().toLocaleDateString(), text: entryText };
      setGratitudeEntries(prev => [...prev, newEntry]);
      gratitudeEntryInput.value = '';
    }
  };

  return (
    <div className="gratitude-journal-content">
      <h2>Gratitude Journal</h2>
      <p>Take a moment to reflect on the positive things in your life. What are you grateful for today?</p>
      <textarea id="gratitudeEntry" className="gratitude-textarea" placeholder="Today I am grateful for..."></textarea>
      <button id="saveGratitudeBtn" className="gratitude-save-button" onClick={handleSaveGratitude}>Save Entry</button>
      <h3>Past Entries:</h3>
      <ul id="gratitudeList" className="gratitude-list-styles">
        {gratitudeEntries.map(entry => (
          <li key={entry.id} className="gratitude-item-styles">
            <strong>{entry.date}:</strong> {entry.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GratitudeJournal;
