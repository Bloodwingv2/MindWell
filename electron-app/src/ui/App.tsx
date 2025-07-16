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

  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref to scroll to the bottom of chat

  useEffect(() => {
    localStorage.setItem('visitedTrackers', JSON.stringify(visitedTrackers));
  }, [visitedTrackers]);

  useEffect(() => {
    localStorage.setItem('completedTrackers', JSON.stringify(completedTrackers));
  }, [completedTrackers]);

  

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
              loading: false, // Set loading to false once content starts streaming
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
          loading: false, // Ensure loading is false when streaming is complete
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
    } finally {
      setIsLoadingResponse(false); // Set loading to false after API call completes (success or error)
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
        {selectedTracker ? (
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
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="hi">Hindi</option>
                            <option value="bn">Bengali</option>
                            <option value="mr">Marathi</option>
                            <option value="ta">Tamil</option>
                            <option value="te">Telugu</option>
                            <option value="kn">Kannada</option>
                            <option value="ml">Malayalam</option>
                            <option value="gu">Gujarati</option>
                            <option value="pa">Punjabi</option>
                            <option value="ur">Urdu</option>
                            <option value="ar">Arabic</option>
                            <option value="zh">Chinese</option>
                            <option value="ja">Japanese</option>
                            <option value="ko">Korean</option>
                            <option value="ru">Russian</option>
                            <option value="pt">Portuguese</option>
                            <option value="it">Italian</option>
                            <option value="nl">Dutch</option>
                            <option value="sv">Swedish</option>
                            <option value="no">Norwegian</option>
                            <option value="da">Danish</option>
                            <option value="fi">Finnish</option>
                            <option value="pl">Polish</option>
                            <option value="tr">Turkish</option>
                            <option value="el">Greek</option>
                            <option value="he">Hebrew</option>
                            <option value="th">Thai</option>
                            <option value="vi">Vietnamese</option>
                            <option value="id">Indonesian</option>
                            <option value="ms">Malay</option>
                            <option value="fa">Persian</option>
                            <option value="sw">Swahili</option>
                            <option value="am">Amharic</option>
                            <option value="ne">Nepali</option>
                            <option value="si">Sinhala</option>
                            <option value="my">Burmese</option>
                            <option value="km">Khmer</option>
                            <option value="lo">Lao</option>
                            <option value="ka">Georgian</option>
                            <option value="az">Azerbaijani</option>
                            <option value="uz">Uzbek</option>
                            <option value="kk">Kazakh</option>
                            <option value="ky">Kyrgyz</option>
                            <option value="tg">Tajik</option>
                            <option value="tk">Turkmen</option>
                            <option value="mn">Mongolian</option>
                            <option value="ug">Uyghur</option>
                            <option value="ps">Pashto</option>
                            <option value="sd">Sindhi</option>
                            <option value="ku">Kurdish</option>
                            <option value="so">Somali</option>
                            <option value="ha">Hausa</option>
                            <option value="yo">Yoruba</option>
                            <option value="ig">Igbo</option>
                            <option value="zu">Zulu</option>
                            <option value="xh">Xhosa</option>
                            <option value="af">Afrikaans</option>
                            <option value="sq">Albanian</option>
                            <option value="hy">Armenian</option>
                            <option value="eu">Basque</option>
                            <option value="be">Belarusian</option>
                            <option value="bs">Bosnian</option>
                            <option value="bg">Bulgarian</option>
                            <option value="ca">Catalan</option>
                            <option value="hr">Croatian</option>
                            <option value="cs">Czech</option>
                            <option value="et">Estonian</option>
                            <option value="tl">Filipino</option>
                            <option value="gl">Galician</option>
                            <option value="ht">Haitian Creole</option>
                            <option value="hu">Hungarian</option>
                            <option value="is">Icelandic</option>
                            <option value="ga">Irish</option>
                            <option value="lv">Latvian</option>
                            <option value="lt">Lithuanian</option>
                            <option value="mk">Macedonian</option>
                            <option value="mg">Malagasy</option>
                            <option value="mt">Maltese</option>
                            <option value="mi">Maori</option>
                            <option value="no">Norwegian</option>
                            <option value="fa">Persian</option>
                            <option value="ro">Romanian</option>
                            <option value="sm">Samoan</option>
                            <option value="sr">Serbian</option>
                            <option value="sk">Slovak</option>
                            <option value="sl">Slovenian</option>
                            <option value="es">Spanish</option>
                            <option value="sw">Swahili</option>
                            <option value="sv">Swedish</option>
                            <option value="tg">Tajik</option>
                            <option value="uk">Ukrainian</option>
                            <option value="cy">Welsh</option>
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
