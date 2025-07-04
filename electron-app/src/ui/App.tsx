import './App.css'
import ISAClogo from '../assets/MindWell.png'
import sentbtn from '../assets/send-svgrepo-com.svg'
import homeicon from '../assets/homeicon.svg'
import settingsicon from '../assets/settingsicon.svg'
import voicemode from '../assets/voicemodeicon.svg'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion';


type Message = {
  id: string; // Add unique ID
  role: 'user' | 'assistant';
  content: string;
  displayedContent?: string; // For character-by-character display
}

interface Tracker {
  id: string;
  title: string;
  description: string;
  content: string; // This will hold the tracker's UI content
}

const trackers: Tracker[] = [
  {
    id: 'chat-assistant',
    title: 'Chat with MindWell',
    description: 'Chat with the MindWell AI assistant.',
    content: `
      <div class="mental-health-chat-section">
        <h3>Chat with MindWell Assistant:</h3>
        <!-- Chat messages and input will be rendered by React components -->
      </div>
    `,
  },
  {
    id: 'mood-tracker',
    title: 'Mood Tracker',
    description: 'Track your daily mood and identify patterns.',
    content: `
      <h2>Mood Tracker</h2>
      <p>Use this tracker to log your mood throughout the day. Understanding your mood patterns can help you identify triggers and develop coping strategies.</p>
      <!-- Mood tracking UI elements will go here -->
      <p>How are you feeling today?</p>
      <div class="mood-options">
        <button>😊 Happy</button>
        <button>😐 Neutral</button>
        <button>😔 Sad</button>
        <button>😠 Angry</button>
        <button>😟 Anxious</button>
      </div>
    `,
  },
  {
    id: 'gratitude-journal',
    title: 'Gratitude Journal',
    description: 'Write down things you are grateful for.',
    content: `
      <h2>Gratitude Journal</h2>
      <p>Take a moment to reflect on the positive things in your life. What are you grateful for today?</p>
      <textarea id="gratitudeEntry" placeholder="Today I am grateful for..."></textarea>
      <button id="saveGratitudeBtn">Save Entry</button>
      <h3>Past Entries:</h3>
      <ul id="gratitudeList" class="gratitude-list">
        <!-- Gratitude entries will be dynamically added here -->
      </ul>
    `,
  },
  {
    id: 'breathing-exercises',
    title: 'Breathing Exercises',
    description: 'Practice calming breathing techniques.',
    content: `
      <h2>Breathing Exercises</h2>
      <p>Deep breathing exercises can help calm your nervous system and reduce stress. Follow the instructions below for a guided breathing session.</p>
      <!-- Breathing exercise UI elements will go here -->
      <p>Inhale deeply for 4 counts, hold for 4 counts, exhale slowly for 6 counts.</p>
      <button>Start Exercise</button>
    `,
  },
  {
    id: 'guided-meditations',
    title: 'Guided Meditations',
    description: 'Listen to guided meditation sessions for relaxation.',
    content: `
      <h2>Guided Meditations</h2>
      <p>Find peace and calm with our guided meditation sessions. Choose a session below to begin.</p>
      <div class="meditation-list">
        <button>5-Minute Mindfulness</button>
        <button>10-Minute Stress Relief</button>
        <button>Sleep Meditation</button>
      </div>
      <!-- Audio player elements would go here -->
    `,
  },
  {
    id: 'wellness-tracker',
    title: 'Wellness Tracker',
    description: 'Track your overall wellness over time.',
    content: `
      <h2>Wellness Tracker</h2>
      <p>Log your daily wellness score (1-10) and see your progress over time.</p>
      <div class="wellness-input-section">
        <input type="number" id="wellnessScore" min="1" max="10" placeholder="Enter wellness score (1-10)" />
        <button id="logWellnessBtn">Log Wellness</button>
      </div>
      <div class="wellness-graph-placeholder">
        <p>Graph of your wellness over time will appear here.</p>
      </div>
    `,
  },
  {
    id: 'goal-setter',
    title: 'Goal Setter',
    description: 'Set and track your personal goals.',
    content: `
      <h2>Goal Setter</h2>
      <p>Set small, achievable goals to improve your well-being.</p>
      <div class="goal-input-section">
        <input type="text" id="newGoalInput" placeholder="Enter a new goal" />
        <button id="addGoalBtn">Add Goal</button>
      </div>
      <ul id="goalList" class="goal-list">
        <!-- Goals will be dynamically added here -->
      </ul>
    `,
  },
];

const affirmations: string[] = [
  "I am worthy of love and happiness.",
  "I am in control of my emotions and my reactions.",
  "I am resilient and can overcome any challenge.",
  "I am grateful for all the good in my life.",
  "I am capable of achieving my goals.",
  "I am at peace with who I am.",
  "I am strong, capable, and enough.",
  "I choose joy and positivity.",
  "I am surrounded by love and support.",
  "I trust in my journey and my growth."
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]); // All Chat messages
  const [input, setInput] = useState(''); // Initialize input state as an empty string
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null); // Default to null for home screen
  const [visitedTrackers, setVisitedTrackers] = useState<string[]>(() => {
    const storedVisited = localStorage.getItem('visitedTrackers');
    return storedVisited ? JSON.parse(storedVisited) : [];
  });
  const [completedTrackers, setCompletedTrackers] = useState<string[]>(() => {
    const storedCompleted = localStorage.getItem('completedTrackers');
    return storedCompleted ? JSON.parse(storedCompleted) : [];
  });
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [wellnessEntries, setWellnessEntries] = useState<{ date: string; score: number }[]>(() => {
    const storedWellness = localStorage.getItem('wellnessEntries');
    return storedWellness ? JSON.parse(storedWellness) : [];
  });
  const [goals, setGoals] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    const storedGoals = localStorage.getItem('goals');
    return storedGoals ? JSON.parse(storedGoals) : [];
  });
  const [gratitudeEntries, setGratitudeEntries] = useState<{ id: string; date: string; text: string }[]>(() => {
    const storedGratitude = localStorage.getItem('gratitudeEntries');
    return storedGratitude ? JSON.parse(storedGratitude) : [];
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref to scroll to the bottom of chat

  useEffect(() => {
    localStorage.setItem('visitedTrackers', JSON.stringify(visitedTrackers));
  }, [visitedTrackers]);

  useEffect(() => {
    localStorage.setItem('completedTrackers', JSON.stringify(completedTrackers));
  }, [completedTrackers]);

  useEffect(() => {
    localStorage.setItem('wellnessEntries', JSON.stringify(wellnessEntries));
  }, [wellnessEntries]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('gratitudeEntries', JSON.stringify(gratitudeEntries));
  }, [gratitudeEntries]);

  useEffect(() => {
    // Set a random affirmation on component mount and every 20 seconds
    const setRandomAffirmation = () => {
      const randomIndex = Math.floor(Math.random() * affirmations.length);
      setCurrentAffirmation(affirmations[randomIndex]);
    };

    setRandomAffirmation(); // Set initial affirmation
    const intervalId = setInterval(setRandomAffirmation, 20000); // Change every 20 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const logWellnessBtn = document.getElementById('logWellnessBtn');
    const wellnessScoreInput = document.getElementById('wellnessScore') as HTMLInputElement;

    const handleLogWellness = () => {
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

    if (logWellnessBtn && wellnessScoreInput) {
      logWellnessBtn.addEventListener('click', handleLogWellness);
    }

    return () => {
      if (logWellnessBtn) {
        logWellnessBtn.removeEventListener('click', handleLogWellness);
      }
    };
  }, [selectedTracker, setWellnessEntries]);

  useEffect(() => {
    const addGoalBtn = document.getElementById('addGoalBtn');
    const newGoalInput = document.getElementById('newGoalInput') as HTMLInputElement;
    const goalListElement = document.getElementById('goalList');

    const renderGoals = () => {
      if (goalListElement) {
        goalListElement.innerHTML = goals.map(goal => `
          <li class="goal-item ${goal.completed ? 'completed' : ''}" data-id="${goal.id}">
            <span>${goal.text}</span>
            <input type="checkbox" ${goal.completed ? 'checked' : ''} />
          </li>
        `).join('');
      }
    };

    const handleAddGoal = () => {
      const goalText = newGoalInput.value.trim();
      if (goalText) {
        const newGoal = { id: Date.now().toString(), text: goalText, completed: false };
        setGoals(prev => [...prev, newGoal]);
        newGoalInput.value = '';
      }
    };

    const handleToggleGoal = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'checkbox') {
        const listItem = target.closest('.goal-item') as HTMLLIElement;
        if (listItem) {
          const goalId = listItem.dataset.id;
          setGoals(prev => prev.map(goal =>
            goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
          ));
        }
      }
    };

    if (addGoalBtn && newGoalInput) {
      addGoalBtn.addEventListener('click', handleAddGoal);
    }

    if (goalListElement) {
      goalListElement.addEventListener('change', handleToggleGoal);
    }

    renderGoals(); // Initial render and re-render on goals change

    return () => {
      if (addGoalBtn) {
        addGoalBtn.removeEventListener('click', handleAddGoal);
      }
      if (goalListElement) {
        goalListElement.removeEventListener('change', handleToggleGoal);
      }
    };
  }, [selectedTracker, goals, setGoals]);

  useEffect(() => {
    const saveGratitudeBtn = document.getElementById('saveGratitudeBtn');
    const gratitudeEntryInput = document.getElementById('gratitudeEntry') as HTMLTextAreaElement;
    const gratitudeListElement = document.getElementById('gratitudeList');

    const renderGratitudeEntries = () => {
      if (gratitudeListElement) {
        gratitudeListElement.innerHTML = gratitudeEntries.map(entry => `
          <li class="gratitude-item">
            <strong>${entry.date}:</strong> ${entry.text}
          </li>
        `).join('');
      }
    };

    const handleSaveGratitude = () => {
      const entryText = gratitudeEntryInput.value.trim();
      if (entryText) {
        const newEntry = { id: Date.now().toString(), date: new Date().toLocaleDateString(), text: entryText };
        setGratitudeEntries(prev => [...prev, newEntry]);
        gratitudeEntryInput.value = '';
      }
    };

    if (saveGratitudeBtn && gratitudeEntryInput) {
      saveGratitudeBtn.addEventListener('click', handleSaveGratitude);
    }

    renderGratitudeEntries();

    return () => {
      if (saveGratitudeBtn) {
        saveGratitudeBtn.removeEventListener('click', handleSaveGratitude);
      }
    };
  }, [selectedTracker, gratitudeEntries, setGratitudeEntries]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior : 'smooth'})
  }

  useEffect(scrollToBottom, [messages]); // scroll to bottom whenever messages change

  // Called When Send Button is clicked
  const askGemma = async () => { // Renamed sendMessage to askGemma
    if (!input.trim()) return;

    const userMessage: Message = { 
      id: Date.now().toString(), // Generate unique ID
      role: 'user' as const, 
      content: input 
    };

    const assistantMessage: Message = { 
      id: (Date.now() + 1).toString(), // Generate unique ID for assistant
      role: 'assistant' as const, 
      content: '', 
      displayedContent: ''
    };

    let assistantMessageIndex: number = -1;

    setMessages(prev => {
      const updatedMessages = [...prev, userMessage, assistantMessage];
      assistantMessageIndex = updatedMessages.length - 1; // Get the index of the newly added assistant message
      return updatedMessages;
    });
    setInput('');

    try {
      const response = await fetch('http://localhost:8000/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          context: selectedTracker ? selectedTracker.content : '',
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) throw new Error('No response body');

      let botReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        botReply += chunk;

        // Update the displayed content character by character
        for (let i = 0; i < chunk.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20)); // Adjust typing speed for smoother animation
          setMessages(prev => {
            const updated = [...prev];
            // Use the captured assistantMessageIndex
            updated[assistantMessageIndex] = {
              ...updated[assistantMessageIndex],
              displayedContent: (updated[assistantMessageIndex].displayedContent || '') + chunk[i],
            };
            return updated;
          });
        }
      }
      // After successful response from Gemma, mark tracker as completed
      // After the streaming is complete, trim the final displayedContent
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          content: botReply.trimEnd(), // Set the final content, trimmed
          displayedContent: (updated[assistantMessageIndex].displayedContent || '').trimEnd(), // Trim the displayed content
        };
        return updated;
      });

      // After successful response from Gemma, mark tracker as completed
      if (selectedTracker && !completedTrackers.includes(selectedTracker.id)) {
        setCompletedTrackers(prev => [...prev, selectedTracker.id]);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const updated = [...prev];
        const lastMessageIndex = updated.length - 1;
        if (lastMessageIndex >= 0 && updated[lastMessageIndex].role === 'assistant') {
          updated[lastMessageIndex] = {
            ...updated[lastMessageIndex],
            content: updated[lastMessageIndex].content + '⚠️ Error connecting to backend.',
            displayedContent: updated[lastMessageIndex].displayedContent + '⚠️ Error connecting to backend.',
          };
        } else {
          updated.push({
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: '⚠️ Error connecting to backend.',
            displayedContent: '⚠️ Error connecting to backend.',
          });
        }
        return updated;
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') askGemma() // Changed sendMessage to askGemma
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="upperside">
          <div className="uppersidetop">
            <img src={ISAClogo} alt="" className="logo" />
            <span className="brand">MindWell</span>
          </div>
          <div className="trackers-list"> {/* New container for trackers */}
            <h3>Trackers & Tools</h3>
            {trackers.map((tracker) => (
              <motion.button
                key={tracker.id}
                className={`tracker-item ${selectedTracker?.id === tracker.id ? 'selected' : ''} ${visitedTrackers.includes(tracker.id) ? 'visited' : ''} ${completedTrackers.includes(tracker.id) ? 'completed' : ''}`}
                onClick={() => {
                  setSelectedTracker(tracker);
                  setMessages([]); // Clear chat when changing trackers
                  if (!visitedTrackers.includes(tracker.id)) {
                    setVisitedTrackers(prev => [...prev, tracker.id]);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tracker.title}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="lowerside">
          <button className="queryBottom" onClick={() => setSelectedTracker(null)}>
            <img src={homeicon} alt="" className = "Homeicon" />Home
            </button>
          <button className="queryBottom">
            <img src={voicemode} alt="" className = "VoiceIcon"/>Voice Mode
            </button>
          <button className="queryBottom">
            <img src={settingsicon} alt="" className = "SettingsIcon"/>Settings
            </button>
        </div>
      </div>
      <div className="main">
        {selectedTracker ? (
          <div className="tracker-content-area">
            {selectedTracker.id !== 'chat-assistant' && (
              <div className="tracker-text" dangerouslySetInnerHTML={{ __html: selectedTracker.content }} />
            )}
            {selectedTracker.id === 'chat-assistant' && (
              <div className="mental-health-chat-section">
                <h3>Chat with MindWell Assistant:</h3>
                <div className="chats">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      className={`message-container ${message.role}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="message-content">
                        <p className="txt">
                          {message.displayedContent || message.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} /> {/* Add this for auto-scroll */}
                </div>
                <div className="chatfooter">
                  <motion.div
                    className="inputbox"
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <input type="text" placeholder='Ask anything about mental health...' value={input} onChange={(e) => { setInput(e.target.value) }} onKeyDown={handleKeyDown} />
                    <motion.button
                      className="send"
                      onClick={askGemma}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    ><img src={sentbtn} alt="" className="sendbtnimg"></img></motion.button>
                  </motion.div>
                  <p className="disclaimer">MindWell Assistant provides general information and support. It is not a substitute for professional medical advice, diagnosis, or treatment.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-screen">
            <h2>Hello User 👋</h2>
            <p>Select a tracker or tool from the sidebar to get started on your mental wellness journey.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App