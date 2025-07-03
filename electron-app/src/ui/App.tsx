import './App.css'
import GemmaTalklogo from '../assets/GemmaTalk.png'
import Placeholder from '../assets/new_user.svg'
import sentbtn from '../assets/send-svgrepo-com.svg'
import homeicon from '../assets/homeicon.svg'
import settingsicon from '../assets/settingsicon.svg'
import newchaticon from '../assets/newchaticon.svg'
import voicemode from '../assets/voicemodeicon.svg'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion';

// Model Selector Component
interface Model {
  id: string;
  name: string;
  description: string;
  size: string;
  color: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const models: Model[] = [
    {
      id: 'llama3.2',
      name: 'Llama 3.2',
      description: 'Fast & efficient',
      size: 'Llama 3.2 3B',
      color: '#60A5FA'
    },
    {
      id: 'mistral',
      name: 'Mistral: Latest',
      description: 'Compact powerhouse',
      size: 'Mistral 3.8B',
      color: '#A78BFA'
    },
    {
      id: 'gemma2:2b',
      name: 'Gemma 2 2B',
      description: 'Lightweight model',
      size: 'Gemma 2 2B',
      color: '#34D399'
    }
  ];

  const currentModel = models.find(model => model.id === selectedModel);

  return (
    <div className="model-selector-container">
      {/* Compact Model Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="model-selector-button"
      >
        <div className="model-selector-color-dot" style={{ backgroundColor: currentModel?.color }} />
        <span>{currentModel?.size}</span>
        <span className={`model-selector-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="model-selector-dropdown">
          {models.map((model, index) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`model-selector-option ${selectedModel === model.id ? 'selected' : ''}`}
              style={{ borderBottom: index < models.length - 1 ? '1px solid #4A5568' : 'none' }}
            >
              <div className="model-selector-option-content">
                <div className="model-selector-option-color-dot" style={{ backgroundColor: model.color }} />
                <div className="model-selector-option-text">
                  <div className="model-selector-option-name">
                    {model.name}
                  </div>
                  <div className="model-selector-option-desc">
                    {model.description}
                  </div>
                </div>
                {selectedModel === model.id && (
                  <div className="model-selector-selected-indicator" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

type Message = {
  id: string; // Add unique ID
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]); // All Chat messages
  const [input, setInput] = useState(''); // Initialize input state as an empty string
  const [selectedModel, setSelectedModel] = useState('llama3.2'); // Selected model state
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Ref to scroll to the bottom of chat

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior : 'smooth'})
  }

  useEffect(scrollToBottom, [messages]); // scroll to bottom whenever messages change

  // Called When Send Button is clicked
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      id: Date.now().toString(), // Generate unique ID
      role: 'user' as const, 
      content: input 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const assistantMessage: Message = { 
      id: (Date.now() + 1).toString(), // Generate unique ID for assistant
      role: 'assistant' as const, 
      content: '', 
      isTyping: true 
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('http://localhost:8000/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          context: '',
          model: selectedModel, // Include selected model in the request
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) throw new Error('No response body');

      let botReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              isTyping: undefined, // Remove isTyping when done
            };
            return updated;
          });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        botReply += chunk;

        // Update the last assistant message in real time
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: botReply,
          };
          return updated;
        });

      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + '⚠️ Error connecting to backend.',
            isTyping: false,
          };
        } else {
          updated.push({
            id: Date.now().toString(), // Add unique ID
            role: 'assistant' as const,
            content: '⚠️ Error connecting to backend.',
            isTyping: false,
          });
        }
        return updated;
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') sendMessage()
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="upperside">
          <div className="uppersidetop">
            <img src={GemmaTalklogo} alt="" className="logo" />
            <span className="brand">GemmaTalk</span>
          </div>
          <button className="midbtn">
            <img src={newchaticon} alt="" className="addicon" />New chat
          </button>
          <div className="upperSideBottom">
            <button className="queryTop">
              <img src="" alt="" />what is programming?
            </button>
            <button className="queryTop">
              <img src="" alt="" />what is programming?
            </button>
          </div>
        </div>
        <div className="lowerside">
          <button className="queryBottom">
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
        <div className = "chats">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`message-container ${message.role}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="message-content">
                <img 
                  src={message.role === 'user' ? Placeholder : GemmaTalklogo} 
                  alt={message.role === 'user' ? 'User' : 'GemmaTalk'} 
                  className={message.role === 'user' ? 'userchatimg' : 'botchatimg'}
                />
                <p className="txt">
                  {message.content}
                  {message.isTyping && (
                    <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} /> {/* Add this for auto-scroll */}
        </div>
        <div className="chatfooter">
          <div className ="inputbox">
            <input type="text" placeholder='Send a Message...' value = {input} onChange={(e) =>{setInput(e.target.value)}} onKeyDown={handleKeyDown}/>
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelChange={setSelectedModel} 
            />
            <button className="send" onClick={sendMessage}><img src = {sentbtn} alt = "" className = "sendbtnimg"></img></button>
          </div>
          <p className ="disclaimer">GemmaTalk. downloads and runs AI models locally via Ollama for on-device inference. Response quality may vary depending on the selected model. Information authenticity is subject to the model selected.</p>
      </div>
    </div>
  </div>
  )
}

export default App