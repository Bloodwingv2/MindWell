import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MoodSummarizer.css';

const MoodSummarizer: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/mood_summary');
      const data = await response.json();

      if (data && data.length > 0 && typeof data[0].summary === 'string') {
        setSummary(data[0].summary);
      } else {
        setSummary("No summary available for today.");
      }
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
      <h1>Mood Summarizer</h1>
      <p>Get AI-generated insights into your mood patterns and receive personalized suggestions for improvement.</p>
      <div className="mood-summary-section">
        <div className="summary-placeholder">
          {isLoading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: summary || 'Your AI-generated summary will appear here.' }} />
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
