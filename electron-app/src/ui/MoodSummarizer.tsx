import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MoodSummarizer.css';

interface MoodEntry {
  mood: string;
  date: string;
}

interface MoodSummarizerProps {
  moodEntries: MoodEntry[];
  setMoodEntries: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
}

const MoodSummarizer: React.FC<MoodSummarizerProps> = ({ moodEntries, setMoodEntries }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodLog = (mood: string) => {
    const newEntry = { mood, date: new Date().toISOString() };
    setMoodEntries(prev => [...prev, newEntry]);
  };

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/summarize-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood_entries: moodEntries }),
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Could not generate summary. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="mood-summarizer-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Mood Summarizer</h2>
      <p>Get AI-generated insights into your mood patterns and receive personalized suggestions for improvement.</p>
      <div className="mood-input-section">
        <h3>How are you feeling today?</h3>
        <div className="mood-options-container">
          <motion.button onClick={() => handleMoodLog('Happy')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>😊 Happy</motion.button>
          <motion.button onClick={() => handleMoodLog('Neutral')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>😐 Neutral</motion.button>
          <motion.button onClick={() => handleMoodLog('Sad')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>😔 Sad</motion.button>
          <motion.button onClick={() => handleMoodLog('Angry')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>😠 Angry</motion.button>
          <motion.button onClick={() => handleMoodLog('Anxious')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>😟 Anxious</motion.button>
        </div>
      </div>
      <div className="mood-summary-section">
        <h3>Your Mood Summary</h3>
        <div className="summary-placeholder">
          {isLoading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            summary || 'Your AI-generated summary will appear here.'
          )}
        </div>
        <motion.button className="summarize-button" onClick={generateSummary} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Summary'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MoodSummarizer;
