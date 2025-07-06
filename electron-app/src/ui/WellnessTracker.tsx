import './WellnessTracker.css';

interface WellnessTrackerProps {
  wellnessEntries: { date: string; score: number }[];
  setWellnessEntries: React.Dispatch<React.SetStateAction<{ date: string; score: number }[]>>;
}

const WellnessTracker: React.FC<WellnessTrackerProps> = ({ wellnessEntries, setWellnessEntries }) => {
  const handleLogWellness = () => {
    const wellnessScoreInput = document.getElementById('wellnessScore') as HTMLInputElement;
    const score = parseInt(wellnessScoreInput.value);
    if (score >= 1 && score <= 10) {
      const newEntry = { date: new Date().toLocaleDateString(), score };
      setWellnessEntries(prev => [...prev, newEntry]);
      wellnessScoreInput.value = ''; // Clear input
      alert('Wellness logged!');
    } else {
      alert('Please enter a score between 1 and 10.');
    }
  };

  return (
    <div className="wellness-tracker-content">
      <h2>Wellness Tracker</h2>
      <p>Log your daily wellness score (1-10) and see your progress over time.</p>
      <div className="wellness-input-container">
        <input type="number" id="wellnessScore" className="wellness-input-field" min="1" max="10" placeholder="Enter wellness score (1-10)" />
        <button id="logWellnessBtn" className="wellness-input-button" onClick={handleLogWellness}>Log Wellness</button>
      </div>
      <div className="wellness-graph-placeholder-styles">
        <p>Graph of your wellness over time will appear here.</p>
      </div>
    </div>
  );
};

export default WellnessTracker;
