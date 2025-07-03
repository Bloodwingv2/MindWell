import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { motion, AnimatePresence } from 'framer-motion';
import App from './App.tsx'
import SplashScreen from './SplashScreen.tsx'

const Main = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5500); // Display splash screen for 5.5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <StrictMode>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <App />
          </motion.div>
        )}
      </AnimatePresence>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<Main />);
