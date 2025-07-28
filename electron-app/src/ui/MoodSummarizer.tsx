import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './MoodSummarizer.css';

interface MoodSummarizerProps {
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

const MoodSummarizer: React.FC<MoodSummarizerProps> = ({ isProcessing, setIsProcessing }) => {
  const [summary, setSummary] = useState('');
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/mood_summary');
      const data = await response.json();

      if (data && data.length > 0) {
        setSummary(data[0].summary || "No summary available for today.");
        if (data[0].tips) {
          setTips(data[0].tips.split('\n').filter((t: string) => t.trim() !== ''));
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
    <div className="mood-summarizer-container">
      <div className="mood-summarizer-header">
        <h1>Mood Summary</h1>
        <p>Get AI-driven insights into your emotional well-being.</p>
      </div>
      <div style={{ textAlign: 'center' }}>
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
        <div className="loading-container">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      ) : (
        <div className="mood-summarizer-content">
          <motion.div 
            className="summary-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Today's Summary</h2>
            <p>{summary}</p>
          </motion.div>
          {tips.length > 0 && (
            <motion.div 
              className="tips-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2>Personalized Tips</h2>
              <ul>
                {tips.map((tip: string, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodSummarizer;
