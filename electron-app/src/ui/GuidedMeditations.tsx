import './GuidedMeditations.css';

interface GuidedMeditationsProps {
  // Define any props needed for GuidedMeditations
}

const GuidedMeditations: React.FC<GuidedMeditationsProps> = () => {
  return (
    <div className="guided-meditations-content">
      <h2>Guided Meditations</h2>
      <p>Find peace and calm with our guided meditation sessions. Choose a session below to begin.</p>
      <div className="meditation-list-container">
        <button className="meditation-list-button">5-Minute Mindfulness</button>
        <button className="meditation-list-button">10-Minute Stress Relief</button>
        <button className="meditation-list-button">Sleep Meditation</button>
      </div>
    </div>
  );
};

export default GuidedMeditations;
