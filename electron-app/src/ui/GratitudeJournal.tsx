import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GratitudeJournal.css';

interface GratitudeJournalProps {
  gratitudeEntries: { id: string; date: string; text: string }[];
  setGratitudeEntries: React.Dispatch<React.SetStateAction<{ id: string; date: string; text: string }[]>>;
}

const GratitudeJournal: React.FC<GratitudeJournalProps> = ({ gratitudeEntries, setGratitudeEntries }) => {
  const [newEntryText, setNewEntryText] = useState('');
  const [currentPage, setCurrentPage] = useState('newEntry'); // 'newEntry' or 'pastEntries'

  const handleSaveGratitude = () => {
    const entryText = newEntryText.trim();
    if (entryText) {
      const newEntry = { id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), text: entryText };
      setGratitudeEntries(prev => [...prev, newEntry]);
      setNewEntryText('');
      setCurrentPage('pastEntries'); // Automatically go to past entries after saving
    }
  };

  const handleDeleteEntry = (id: string) => {
    setGratitudeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const pageVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    in: {
      x: 0,
      opacity: 1,
    },
    out: (direction: number) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const pageTransition = {
    duration: 0.5,
  };

  return (
    <motion.div
      className="gratitude-journal-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="journal-pages-wrapper">
        <div className="journal-header">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Gratitude Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Cultivate an attitude of gratitude.
          </motion.p>
        </div>

        <div className="journal-content">
          <AnimatePresence initial={false} custom={currentPage === 'newEntry' ? 1 : -1}>
            {currentPage === 'newEntry' && (
              <motion.div
                key="newEntry"
                className="new-entry-section journal-page"
                custom={1}
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                <h2>What are you grateful for today?</h2>
                <textarea
                  className="gratitude-textarea"
                  placeholder="Today I am grateful for..."
                  value={newEntryText}
                  onChange={(e) => setNewEntryText(e.target.value)}
                ></textarea>
                <motion.button
                  className="gratitude-save-button"
                  onClick={handleSaveGratitude}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Entry
                </motion.button>
              </motion.div>
            )}

            {currentPage === 'pastEntries' && (
              <motion.div
                key="pastEntries"
                className="past-entries-section journal-page"
                custom={-1}
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                <h2>Past Entries</h2>
                <ul className="gratitude-list-styles">
                  {gratitudeEntries.length > 0 ? (
                    [...gratitudeEntries].reverse().map(entry => (
                      <motion.li
                        key={entry.id}
                        className="gratitude-item-styles"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="entry-text-container">
                          <span className="entry-date">{entry.date}:</span> {entry.text}
                        </div>
                        <motion.button
                          className="delete-entry-button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          &times;
                        </motion.button>
                      </motion.li>
                    ))
                  ) : (
                    <li className="no-entries">No past entries yet. Start writing!</li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="journal-navigation">
          <motion.button
            className="nav-button prev-button"
            onClick={() => setCurrentPage('newEntry')}
            disabled={currentPage === 'newEntry'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            New Entry
          </motion.button>
          <motion.button
            className="nav-button next-button"
            onClick={() => setCurrentPage('pastEntries')}
            disabled={currentPage === 'pastEntries'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Past Entries
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GratitudeJournal;
