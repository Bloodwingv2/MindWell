import './MoodTracker.css';

interface MoodTrackerProps {
  // Define any props needed for MoodTracker
}

const MoodTracker: React.FC<MoodTrackerProps> = () => {
  return (
    <div className="mood-tracker-content">
      <h2>Mood Tracker</h2>
      <p>Use this tracker to log your mood throughout the day. Understanding your mood patterns can help you identify triggers and develop coping strategies.</p>
      <p>How are you feeling today?</p>
      <div className="mood-options-container">
        <button>😊 Happy</button>
        <button>😐 Neutral</button>
        <button>😔 Sad</button>
        <button>😠 Angry</button>
        <button>😟 Anxious</button>
      </div>
    </div>
  );
};

export default MoodTracker;
