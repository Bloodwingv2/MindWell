import './App.css'
import WellnessTracker from './WellnessTracker'; // Import WellnessTracker
import MoodSummarizer from './MoodSummarizer'; // Import MoodSummarizer

import ISAClogo from '../assets/MindWell.png'
import sentbtn from '../assets/send-svgrepo-com.svg'
import homeicon from '../assets/homeicon.svg'
import settingsicon from '../assets/settingsicon.svg'
import voicemode from '../assets/voicemodeicon.svg'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';


type Message = {
  id: string; // Add unique ID
  role: 'user' | 'assistant';
  content: string;
  displayedContent?: string; // For character-by-character display
  loading?: boolean; // Add loading state for assistant messages
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
    content: '',
  },
  {
    id: 'mood-summarizer',
    title: 'Mood Summarizer',
    description: 'Get AI-driven insights on your mood.',
    content: '', // Content will be rendered by the MoodSummarizer component
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
    content: ``,
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

interface TerminalComponentProps {
  terminalRef: React.MutableRefObject<Terminal | null>;
  fitAddonRef: React.MutableRefObject<FitAddon | null>;
  onTerminalReady: () => void; // Callback for when terminal is ready
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ terminalRef, fitAddonRef, onTerminalReady }) => {
  useEffect(() => {
    const term = new Terminal({
      convertEol: true,
      fontFamily: `'Fira Code', monospace`,
      fontSize: 15,
      fontWeight: 'normal',
      theme: {
        background: '#282c34',
        foreground: '#abb2bf',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    const terminalContainer = document.getElementById('terminal-container');
    if (terminalContainer) {
      term.open(terminalContainer);
      fitAddon.fit();
      onTerminalReady(); // Call the callback when terminal is ready
    }

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    return () => {
      term.dispose();
    };
  }, []);

  return <div id="terminal-container" style={{ width: '100%', height: '100%' }} />;
};

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
  const [moodEntries, setMoodEntries] = useState<{ mood: string; date: string }[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false); // New loading state
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English
  const [showTerminal, setShowTerminal] = useState(false);
  const [isTerminalReady, setIsTerminalReady] = useState(false); // New state for terminal readiness
  const [pendingTerminalMessages, setPendingTerminalMessages] = useState<string[]>([]); // New state for pending messages

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref to scroll to the bottom of chat
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    localStorage.setItem('visitedTrackers', JSON.stringify(visitedTrackers));
  }, [visitedTrackers]);

  useEffect(() => {
    localStorage.setItem('completedTrackers', JSON.stringify(completedTrackers));
  }, [completedTrackers]);

  useEffect(() => {
    if (selectedTracker?.id !== 'chat-assistant') {
      setShowTerminal(false);
    }
  }, [selectedTracker]);

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
    if (isTerminalReady && pendingTerminalMessages.length > 0) {
      pendingTerminalMessages.forEach(msg => {
        if (terminalRef.current) {
          if (msg.startsWith('\r')) {
            terminalRef.current.write(msg);
          } else {
            terminalRef.current.writeln(msg);
          }
        }
      });
      setPendingTerminalMessages([]);
    }
  }, [isTerminalReady, pendingTerminalMessages]);

  const handleTerminalReady = () => {
    setIsTerminalReady(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior : 'smooth'})
  }

  useEffect(scrollToBottom, [messages]); // scroll to bottom whenever messages change

  // Helper function to write to terminal
  const writeToTerminal = (message: string, isWrite: boolean = false) => {
    if (isTerminalReady && terminalRef.current) {
      if (isWrite) {
        terminalRef.current.write(message);
      } else {
        terminalRef.current.writeln(message);
      }
    } else {
      setPendingTerminalMessages(prev => [...prev, message]);
    }
  };

  // Helper function to check if a chunk is terminal output
  const isTerminalOutput = (chunk: string): boolean => {
    return chunk.includes("Model not found locally") || 
           chunk.includes("pulling manifest") || 
           chunk.includes("Download") ||
           chunk.includes("verifying sha256") ||
           chunk.includes("writing manifest") ||
           chunk.includes("removing any unused layers") ||
           chunk.includes("success");
  };

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
      displayedContent: '',
      loading: true // Set loading to true initially
    };

    let assistantMessageIndex: number = -1;

    setMessages(prev => {
      const updatedMessages = [...prev, userMessage, assistantMessage];
      assistantMessageIndex = updatedMessages.length - 1; // Get the index of the newly added assistant message
      return updatedMessages;
    });
    setInput('');
    setIsLoadingResponse(true); // Set loading to true when API call starts

    let modelWasDownloaded = false;
    let isModelDownloadPhase = false;
    let downloadCompleted = false;
    
    try {
      const response = await fetch('http://localhost:8000/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          context: selectedTracker ? selectedTracker.content : '',
          language: selectedLanguage,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) throw new Error('No response body');

      let botReply = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Try to parse complete JSON objects from the buffer
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const jsonResponse = JSON.parse(line);
            
            // Handle model download status messages
            if (jsonResponse.status) {
              if (jsonResponse.status.includes("Model not found locally") || 
                  jsonResponse.status.includes("pulling manifest")) {
                isModelDownloadPhase = true;
                modelWasDownloaded = true;
                setShowTerminal(true);
                writeToTerminal(jsonResponse.status);
              } else if (jsonResponse.status.includes("success")) {
                downloadCompleted = true;
                isModelDownloadPhase = false;
                writeToTerminal(jsonResponse.status);
                writeToTerminal('\nModel download completed. Returning to chat...');
                
                // Close terminal after showing completion message
                setTimeout(() => {
                  setShowTerminal(false);
                  setIsTerminalReady(false); // Reset terminal ready state
                  // Refresh the page to ensure the system uses the newly downloaded model
                  window.location.reload();
                }, 3000); // Increased delay to 3 seconds to ensure user sees the completion message
                
              } else if (isModelDownloadPhase) {
                writeToTerminal(jsonResponse.status);
              }
            }
            
            // Handle download progress
            if (jsonResponse.digest && isModelDownloadPhase) {
              const progressMessage = `\r${jsonResponse.digest}: ${(jsonResponse.completed / jsonResponse.total * 100).toFixed(2)}%`;
              writeToTerminal(progressMessage, true);
            }
            
          } catch (e) {
            // Handle non-JSON chunks
            const cleanChunk = line.trim();
            if (!cleanChunk) continue;
            
            // Check if this is terminal output
            if (isTerminalOutput(cleanChunk)) {
              if (cleanChunk.includes("Model not found locally")) {
                isModelDownloadPhase = true;
                modelWasDownloaded = true;
                setShowTerminal(true);
              }
              if (isModelDownloadPhase) {
                writeToTerminal(cleanChunk);
                
                // Check for success in non-JSON format
                if (cleanChunk.includes("success")) {
                  downloadCompleted = true;
                  isModelDownloadPhase = false;
                  writeToTerminal('\nModel download completed. Returning to chat...');
                  
                  // Close terminal after showing completion message
                  setTimeout(() => {
                    setShowTerminal(false);
                    setIsTerminalReady(false); // Reset terminal ready state
                    // Refresh the page to ensure the system uses the newly downloaded model
                    window.location.reload();
                  }, 3000);
                }
              }
            } else {
              // This is regular chat content - only process if not in download phase or download is completed
              if (!isModelDownloadPhase || downloadCompleted) {
                botReply += cleanChunk;
                
                // Update the displayed content character by character
                for (let i = 0; i < cleanChunk.length; i++) {
                  await new Promise(resolve => setTimeout(resolve, 20));
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[assistantMessageIndex] = {
                      ...updated[assistantMessageIndex],
                      displayedContent: (updated[assistantMessageIndex].displayedContent || '') + cleanChunk[i],
                      loading: false,
                    };
                    return updated;
                  });
                }
              }
            }
          }
        }
      }
      
      // Handle any remaining buffer content
      if (buffer.trim() && !isTerminalOutput(buffer.trim()) && (!isModelDownloadPhase || downloadCompleted)) {
        botReply += buffer.trim();
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantMessageIndex] = {
            ...updated[assistantMessageIndex],
            displayedContent: (updated[assistantMessageIndex].displayedContent || '') + buffer.trim(),
            loading: false,
          };
          return updated;
        });
      }

      // Final cleanup and state updates - only if download wasn't successful
      if (modelWasDownloaded && !downloadCompleted) {
        writeToTerminal('\nModel download process completed. Returning to chat...');
        // Close terminal after showing completion message
        setTimeout(() => {
          setShowTerminal(false);
          setIsTerminalReady(false); // Reset terminal ready state
        }, 3000);
      }

      // Set final message content
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          content: botReply.trimEnd() || (modelWasDownloaded && !botReply.trim() ? 'Model downloaded successfully. Please try your question again.' : ''),
          displayedContent: (updated[assistantMessageIndex].displayedContent || '').trimEnd() || (modelWasDownloaded && !botReply.trim() ? 'Model downloaded successfully. Please try your question again.' : ''),
          loading: false,
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
            content: '⚠️ Error connecting to backend.',
            displayedContent: '⚠️ Error connecting to backend.',
            loading: false,
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
    } finally {
      setIsLoadingResponse(false);
      
      // Ensure terminal closes if model was downloaded but no success message was caught
      if (modelWasDownloaded && !downloadCompleted) {
        setTimeout(() => {
          setShowTerminal(false);
          setIsTerminalReady(false);
          // Refresh the page to ensure the system uses the newly downloaded model
          window.location.reload();
        }, 5000); // Fallback timeout
      }
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
        {showTerminal ? (
          <TerminalComponent terminalRef={terminalRef} fitAddonRef={fitAddonRef} onTerminalReady={handleTerminalReady} />
        ) : selectedTracker ? (
          <div className="tracker-content-area">
            {selectedTracker.id === 'mood-summarizer' ? (
              <MoodSummarizer moodEntries={moodEntries} setMoodEntries={setMoodEntries} />
            ) : selectedTracker.id === 'wellness-tracker' ? (
              <WellnessTracker />
            ) : selectedTracker.id === 'chat-assistant' ? (
                <div className="mental-health-chat-section">
                    <div className="chat-header">
                        <h3>MindWell Assistant</h3>
                        <p>Your friendly and supportive AI companion.</p>
                    </div>
                    <div className="chats">
                    {messages.map((message, index) => (
                        <motion.div
                        key={index}
                        className={`message-container ${message.role}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        >
                        <div className="message-content">
                            <p>
                            {message.displayedContent || message.content}
                            {message.role === 'assistant' && message.loading && (
                                <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                                </div>
                            )}
                            </p>
                        </div>
                        </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                    </div>
                    <div className="chatfooter">
                    <motion.div
                        className="inputbox"
                        initial={{ scale: 0.98, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <input type="text" placeholder='Ask anything...' value={input} onChange={(e) => { setInput(e.target.value) }} onKeyDown={handleKeyDown} disabled={isLoadingResponse} />
                        <select
                            className="language-selector"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            <option value="en">English</option>
                            <option value="es">Japanese</option>
                            <option value="fr">German</option>
                            <option value="de">Korean</option>
                            <option value="bn">Spanish</option>
                            <option value="mr">French</option>
                        </select>
                        <motion.button
                        className="send"
                        onClick={askGemma}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoadingResponse}
                        ><img src={sentbtn} alt="" className="sendbtnimg"></img></motion.button>
                    </motion.div>
                    <p className="disclaimer">MindWell is an AI assistant and not a substitute for professional medical advice.</p>
                    </div>
                </div>
            ) : (
              <div className="tracker-text" dangerouslySetInnerHTML={{ __html: selectedTracker.content }} />
            )}
          </div>
        ) : (
          <div className="welcome-screen">
            <h2>Hello User 👋</h2>
            <p>Select a tracker or tool from the sidebar to get started on your mental wellness journey.</p>
            {currentAffirmation && <p className="affirmation">{currentAffirmation}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App