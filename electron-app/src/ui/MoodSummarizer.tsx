import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './MoodSummarizer.css';

interface MoodSummarizerProps {
  moodEntries: { mood: string; date: string }[];
  setMoodEntries: React.Dispatch<React.SetStateAction<{ mood: string; date: string }[]>>;
}

const MoodSummarizer: React.FC<MoodSummarizerProps> = ({ moodEntries, setMoodEntries }) => {
  const [summary, setSummary] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/mood_summary');
      const data = await response.json();

      if (data && data.length > 0) {
        setSummary(data[0].summary || "No summary available for today.");
        if (data[0].tips) {
          setTips(data[0].tips.split('- ').filter(t => t.trim() !== ''));
        }
      } else {
        setSummary("No summary available for today.");
        setTips([]);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary('Could not fetch summary. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const processConversations = async () => {
    setIsProcessing(true);
    try {
      await fetch('http://localhost:8000/process_conversations', { method: 'POST' });
      // After processing, refresh the summary data
      fetchSummary();
    } catch (error) {
      console.error('Error processing conversations:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <motion.div
      className="mood-summarizer-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mood-summary-section">
        <div className="header-section">
            <h1>Mood Summary</h1>
            <motion.button 
              className="process-button" 
              onClick={processConversations} 
              disabled={isProcessing}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              {isProcessing ? 'Processing...' : 'Analyze Conversations'}
            </motion.button>
        </div>
        {isLoading ? (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <>
            <div className="summary-placeholder">
              <p>{summary}</p>
            </div>
            {tips.length > 0 && (
              <div className="tips-section">
                <h4>Personalized Tips</h4>
                <ul>
                  {tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MoodSummarizer;
