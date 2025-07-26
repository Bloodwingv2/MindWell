import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WelcomeScreen.css'

interface Tracker {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: string;
}

interface WelcomeScreenProps {
  userName: string;
  setSelectedTracker: (tracker: Tracker | null) => void;
  trackers: Tracker[];
}

const affirmations: string[] = [
  "You are exactly where you need to be right now ✨",
  "Your journey matters, and so do you 💜",
  "Every small step forward is progress worth celebrating 🌟",
  "You have the strength to overcome any challenge 💪",
  "Today is full of possibilities waiting for you 🌅",
  "You are worthy of love, joy, and all good things 💝",
  "Your growth journey is beautiful and uniquely yours 🌱",
  "You're doing better than you think you are 🤗",
  "Trust yourself - you have all the wisdom you need 🧠",
  "You bring light and positivity to the world 🌞"
];

const floatingElements = [
  { emoji: '🌸', delay: 0 },
  { emoji: '🦋', delay: 0.5 },
  { emoji: '✨', delay: 1 },
  { emoji: '🌟', delay: 1.5 },
  { emoji: '💜', delay: 2 },
  { emoji: '🌺', delay: 2.5 },
  { emoji: '🌿', delay: 3 },
  { emoji: '☀️', delay: 3.5 }
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, setSelectedTracker, trackers }) => {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Good morning');
    else if (hour < 17) setTimeOfDay('Good afternoon');
    else setTimeOfDay('Good evening');

    // Initialize first affirmation
    setCurrentAffirmation(affirmations[0]);
    
    // Cycle through affirmations
    const intervalId = setInterval(() => {
      setAffirmationIndex(prev => (prev + 1) % affirmations.length);
    }, 8000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCurrentAffirmation(affirmations[affirmationIndex]);
  }, [affirmationIndex]);

  return (
    <div className="welcome-container">
      {/* Animated background gradient */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Floating elements */}
      <div className="floating-elements">
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            className={`floating-element element-${index + 1}`}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: [100, -100],
              x: [0, Math.sin(index) * 50]
            }}
            transition={{
              duration: 12,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {element.emoji}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="welcome-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Time-based greeting */}
        <motion.div
          className="greeting"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {timeOfDay} ☀️
        </motion.div>

        {/* Main welcome message */}
        <motion.h1
          className="welcome-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Welcome back, 
          <span className="user-name"> {userName}</span>
          <motion.span
            className="wave-emoji"
            animate={{ 
              rotate: [0, 20, 0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          >
            👋
          </motion.span>
        </motion.h1>

        {/* Decorative divider */}
        <motion.div
          className="decorative-divider"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 120, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="divider-dot"></div>
          <div className="divider-line"></div>
          <div className="divider-dot"></div>
        </motion.div>

        {/* Motivational text */}
        <motion.p
          className="welcome-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Ready to continue your wellness journey? Your mental health and happiness matter. 
          Let's make today a step forward together. 💜
        </motion.p>

        {/* Interactive action buttons */}
        <motion.div
          className="action-buttons"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.button
            className="primary-btn get-started"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(139, 69, 199, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTracker(trackers[0])}
          >
            <span className="btn-icon">🚀</span>
            <span className="btn-text">Start Your Day</span>
            <div className="btn-shine"></div>
          </motion.button>

          <motion.button
            className="secondary-btn explore"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(255, 255, 255, 0.15)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const randomTracker = trackers[Math.floor(Math.random() * trackers.length)];
              setSelectedTracker(randomTracker);
            }}
          >
            <span className="btn-icon">✨</span>
            <span className="btn-text">Explore Tools</span>
          </motion.button>
        </motion.div>

        {/* Dynamic affirmation display */}
        <motion.div
          className="affirmation-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <div className="affirmation-label">Daily Reminder</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={affirmationIndex}
              className="affirmation-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {currentAffirmation}
            </motion.div>
          </AnimatePresence>
          
          {/* Progress indicator for affirmations */}
          <div className="affirmation-progress">
            {affirmations.map((_, index) => (
              <motion.div
                key={index}
                className={`progress-dot ${index === affirmationIndex ? 'active' : ''}`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Stats preview cards */}
        <motion.div
          className="stats-preview"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          >
            <div className="stat-icon">📊</div>
            <div className="stat-label">Track Progress</div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          >
            <div className="stat-icon">🎯</div>
            <div className="stat-label">Set Goals</div>
          </motion.div>
          
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          >
            <div className="stat-icon">🏆</div>
            <div className="stat-label">Celebrate Wins</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;