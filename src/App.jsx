import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [captcha, setCaptcha] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setUserInput('');
    setMessage('');
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Validate captcha
  const validateCaptcha = () => {
    if (userInput === captcha) {
      setMessage('✓ Captcha verified successfully!');
    } else {
      setMessage('✗ Captcha verification failed. Please try again.');
      setTimeout(() => {
        generateCaptcha();
      }, 2000);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Random Captcha Generator</h1>
        <div className="captcha-box">
          <div className="captcha-display">
            {captcha.split('').map((char, index) => (
              <span key={index} className="captcha-char">
                {char}
              </span>
            ))}
          </div>
          <button className="refresh-btn" onClick={generateCaptcha} title="Refresh Captcha">
            ↻
          </button>
        </div>
        <input
          type="text"
          placeholder="Enter the captcha"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="captcha-input"
        />
        <button className="verify-btn" onClick={validateCaptcha}>
          Verify
        </button>
        {message && (
          <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
