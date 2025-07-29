import React, { useMemo } from 'react';
import GemmaTalkLogo from '../assets/MindWell.png';
import './SplashScreen.css';

const quotes = [
  "Fun Fact: Did you know that Mindwell, utilizes a custom backend to run multiple LLMs? This means you can enjoy a fully private AI experience without relying on third-party services!",
  "Fun Fact: Mindwell introduces a smart mood summarizer that analyzes your journal entries and provides insights into your emotional well-being. It's like having a personal therapist at your fingertips!",
  "Fun Fact: If you skip Leg day, i will log your Ip address to call an airstrike, Just Kidding!, not.",
  "Fun Fact: Mindwell was originally built without the help of LLM's jeez, talk about wasted time.",
  "Fun Fact: Mindwell was built my Mirang Bhandari', after witnessing the potential of Gemma3n's performance and multilingual capabilities.",
  "Fun Fact: Mindwell is designed to be a fully private AI assistant, ensuring that your data remains secure and confidential. No third-party services involved!",
  "Fun Fact: Mindwell's unique Async backend allows you to utilize the already cached LLM's to run your tools, making it faster and much more efficient than calling new instances again and again!",
  "Fun Fact: Mindwell's custom backend is designed to store data on your device and only you can access, export and delete this data, how COOL is that??.",
];

const SplashScreen: React.FC = () => {
  const text = "MindWell";
  // Pick a random quote only once per mount
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={GemmaTalkLogo} alt="GemmaTalk Logo" className="GemmaTalk-logo" />
        <div className="GemmaTalk-text-container">
          {text}
          <span className="blinking-caret">&nbsp;</span>
        </div>
        <div className="Thought">
          {quote}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
