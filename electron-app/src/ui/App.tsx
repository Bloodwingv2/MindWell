import './App.css'
import WellnessTracker from './WellnessTracker';
import MoodSummarizer from './MoodSummarizer';
import MemoryLane from './MemoryLane';
import Settings from './settings'; // Import Settings

import ISAClogo from '../assets/MindWell.png'
import sentbtn from '../assets/send-svgrepo-com.svg'
import homeicon from '../assets/home-button.png'
import settingsicon from '../assets/setting.png'
import chaticon from '../assets/MindWell.png';
import moodicon from '../assets/dial.png';
import memoryicon from '../assets/memory-recall.png';
import wellnessicon from '../assets/growth.png';

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';


type Message = {
  id: string; 
  role: 'user' | 'assistant';
  content: string;
  displayedContent?: string; 
  loading?: boolean; 
}

interface Tracker {
  id: string;
  title: string;
  description: string;
  content: string; 
  icon: string;
}

const trackers: Tracker[] = [
  {
    id: 'chat-assistant',
    title: 'Chat with MindWell',
    description: 'Chat with the MindWell AI assistant.',
    content: '',
    icon: chaticon,
  },
  {
    id: 'mood-summarizer',
    title: 'Mood Summarizer',
    description: 'Get AI-driven insights on your mood.',
    content: '', 
    icon: moodicon,
  },
  {
    id: 'memory-lane',
    title: 'Memory Lane',
    description: 'Relive your positive memories.',
    content: '',
    icon: memoryicon,
  },
   {
    id: 'wellness-tracker',
    title: 'Wellness Tracker',
    description: 'Track your overall wellness over time.',
    content: ``,
    icon: wellnessicon,
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
  onTerminalReady: () => void; 
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
      onTerminalReady(); 
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [showSettings, setShowSettings] = useState(false);
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
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showTerminal, setShowTerminal] = useState(false);
  const [isTerminalReady, setIsTerminalReady] = useState(false);
  const [pendingTerminalMessages, setPendingTerminalMessages] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
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
    const setRandomAffirmation = () => {
      const randomIndex = Math.floor(Math.random() * affirmations.length);
      setCurrentAffirmation(affirmations[randomIndex]);
    };

    setRandomAffirmation();
    const intervalId = setInterval(setRandomAffirmation, 20000);

    return () => clearInterval(intervalId);
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

  useEffect(() => {
    const processMemories = async () => {
      try {
        await fetch('http://localhost:8000/process_conversations', { method: 'POST' });
        console.log('Conversations processed successfully on startup.');
      } catch (error) {
        console.error('Error processing conversations on startup:', error);
      }
    };

    processMemories();
  }, []);

  const handleTerminalReady = () => {
    setIsTerminalReady(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior : 'smooth'})
  }

  useEffect(scrollToBottom, [messages]);

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

  const isTerminalOutput = (chunk: string): boolean => {
    return chunk.includes("Model not found locally") || 
           chunk.includes("pulling manifest") || 
           chunk.includes("Download") ||
           chunk.includes("verifying sha256") ||
           chunk.includes("writing manifest") ||
           chunk.includes("removing any unused layers") ||
           chunk.includes("success");
  };

  const askGemma = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      id: Date.now().toString(),
      role: 'user' as const, 
      content: input 
    };

    const assistantMessage: Message = { 
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const, 
      content: '', 
      displayedContent: '',
      loading: true
    };

    let assistantMessageIndex: number = -1;

    setMessages(prev => {
      const updatedMessages = [...prev, userMessage, assistantMessage];
      assistantMessageIndex = updatedMessages.length - 1;
      return updatedMessages;
    });
    setInput('');
    setIsLoadingResponse(true);

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
          userName: userName,
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
        
        let lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const jsonResponse = JSON.parse(line);
            
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
                
                setTimeout(() => {
                  setShowTerminal(false);
                  setIsTerminalReady(false);
                  window.location.reload();
                }, 3000);
                
              } else if (isModelDownloadPhase) {
                writeToTerminal(jsonResponse.status);
              }
            }
            
            if (jsonResponse.digest && isModelDownloadPhase) {
              const progressMessage = `\r${jsonResponse.digest}: ${(jsonResponse.completed / jsonResponse.total * 100).toFixed(2)}%`;
              writeToTerminal(progressMessage, true);
            }
            
          } catch (e) {
            const cleanChunk = line.trim();
            if (!cleanChunk) continue;
            
            if (isTerminalOutput(cleanChunk)) {
              if (cleanChunk.includes("Model not found locally")) {
                isModelDownloadPhase = true;
                modelWasDownloaded = true;
                setShowTerminal(true);
              }
              if (isModelDownloadPhase) {
                writeToTerminal(cleanChunk);
                
                if (cleanChunk.includes("success")) {
                  downloadCompleted = true;
                  isModelDownloadPhase = false;
                  writeToTerminal('\nModel download completed. Returning to chat...');
                  
                  setTimeout(() => {
                    setShowTerminal(false);
                    setIsTerminalReady(false);
                    window.location.reload();
                  }, 3000);
                }
              }
            } else {
              if (!isModelDownloadPhase || downloadCompleted) {
                botReply += cleanChunk;
                
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

      if (modelWasDownloaded && !downloadCompleted) {
        writeToTerminal('\nModel download process completed. Returning to chat...');
        setTimeout(() => {
          setShowTerminal(false);
          setIsTerminalReady(false);
        }, 3000);
      }

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
      
      if (modelWasDownloaded && !downloadCompleted) {
        setTimeout(() => {
          setShowTerminal(false);
          setIsTerminalReady(false);
          window.location.reload();
        }, 5000);
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') askGemma()
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="upperside">
          <div className="uppersidetop">
            <img src={ISAClogo} alt="" className="logo" />
            <span className="brand">MindWell</span>
          </div>
          <div className="trackers-list">
            <h3>Trackers & Tools</h3>
            {trackers.map((tracker) => (
              <motion.button
                key={tracker.id}
                className={`tracker-item ${selectedTracker?.id === tracker.id ? 'selected' : ''} ${visitedTrackers.includes(tracker.id) ? 'visited' : ''} ${completedTrackers.includes(tracker.id) ? 'completed' : ''}`}
                onClick={() => {
                  setSelectedTracker(tracker);
                  setShowSettings(false);
                  if (!visitedTrackers.includes(tracker.id)) {
                    setVisitedTrackers(prev => [...prev, tracker.id]);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img src={tracker.icon} alt={`${tracker.title} icon`} className="tracker-icon" />
                {tracker.title}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="lowerside">
          <button className="queryBottom" onClick={() => {setSelectedTracker(null); setShowSettings(false)}}>
            <img src={homeicon} alt="" className = "Homeicon" />Home
            </button>
          <button className="queryBottom" onClick={() => {setSelectedTracker(null); setShowSettings(true)}}>
            <img src={settingsicon} alt="" className = "SettingsIcon"/>Settings
            </button>
        </div>
      </div>
      <div className="main">
        {showTerminal ? (
          <TerminalComponent terminalRef={terminalRef} fitAddonRef={fitAddonRef} onTerminalReady={handleTerminalReady} />
        ) : showSettings ? (
          <Settings userName={userName} setUserName={setUserName} />
        ) : selectedTracker ? (
          <div className="tracker-content-area">
            {selectedTracker.id === 'mood-summarizer' ? (
              <MoodSummarizer moodEntries={moodEntries} setMoodEntries={setMoodEntries} />
            ) : selectedTracker.id === 'wellness-tracker' ? (
              <WellnessTracker />
            ) : selectedTracker.id === 'memory-lane' ? (
              <MemoryLane />
            ) : selectedTracker.id === 'chat-assistant' ? (
                <div className="mental-health-chat-section">
                    <div className="chat-header">
                        <h3>MindWell Assistant</h3>
                        <p>Your friendly and supportive AI companion.</p>
                    </div>
                    <div className="chats">
                    {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`message-container ${message.role}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="message-content">
                        {message.role === 'assistant' && message.loading && !message.displayedContent ? (
                          <div className="loading-dots typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        ) : (
                          <p>{message.displayedContent || message.content}</p>
                        )}
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
            <h2>Hello {userName} 👋</h2>
            <p>Select a tracker or tool from the sidebar to get started on your mental wellness journey.</p>
            {currentAffirmation && <p className="affirmation">{currentAffirmation}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

