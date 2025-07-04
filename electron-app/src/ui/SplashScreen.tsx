import React, { useMemo } from 'react';
import GemmaTalkLogo from '../assets/MindWell.png';
import './SplashScreen.css';

const quotes = [
  "Fun Fact: Did you know that GemmaTalk stands for Intelligent System Analytic Computer?",
  "Fun Fact: GemmaTalk introduces a Python-free backend for running multiple LLMs—giving you a fully private AI",
  "Fun Fact: If you skip Leg day, i will log your Ip address to call an airstrike",
  "Fun Fact: GemmaTalk was originally built without the help of LLM's jeez, talk about wasted time.",
  "Fun Fact: GemmaTalk is the property of \n 'The Division', a franchise Made by Ubisoft.",
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
