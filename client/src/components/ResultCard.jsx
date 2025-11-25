import React, { useState, useEffect, useRef } from 'react';
import { FaExternalLinkAlt, FaRobot, FaVolumeUp, FaStopCircle } from 'react-icons/fa';

const ResultCard = ({ data }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // We store the best voice found in a ref so we don't search every time
  const voiceRef = useRef(null);

  // 1. LOAD VOICES ON MOUNT
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // The Algorithm to find the "Best" voice:
      // Priority 1: Google US English (Best on Chrome)
      // Priority 2: Microsoft Zira/David (Good on Windows)
      // Priority 3: Any "English" voice
      voiceRef.current = voices.find(v => v.name.includes("Google US English")) 
                      || voices.find(v => v.name.includes("Natural")) 
                      || voices.find(v => v.lang === "en-US");
    };

    // Browsers load voices asynchronously, so we listen for the event
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Try loading immediately too

    // Cleanup
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!data) return null;

  const verdict = data.verdict.toLowerCase();
  let statusClass = "Misleading";
  let color = "#f59e0b";

  if (verdict.includes("true")) { statusClass = "True"; color = "#10b981"; }
  if (verdict.includes("false")) { statusClass = "False"; color = "#ef4444"; }

  let confidence = data.confidence || 0;
  if (confidence <= 1) confidence = Math.round(confidence * 100);

  // 2. ENHANCED SPEECH FUNCTION
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Create the utterance
      const utterance = new SpeechSynthesisUtterance(data.summary);
      
      // APPLY THE "HUMAN" SETTINGS
      if (voiceRef.current) utterance.voice = voiceRef.current;
      
      utterance.rate = 0.95;  // 0.95 is slightly slower, more deliberate (News Anchor style)
      utterance.pitch = 1; // Neutral pitch
      utterance.volume = 1; 

      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="result-card">
      <div className="badge-container">
        <span className={`badge ${statusClass}`}>
          {data.verdict}
        </span>
        
        <div>
          <div className="meter-label">AI Confidence: {confidence}%</div>
          <div className="meter-bg">
            <div 
              className="meter-fill" 
              style={{ width: `${confidence}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <FaRobot size={30} color={color} style={{ minWidth: '30px', marginTop: '5px' }}/>
        
        <div style={{ width: '100%' }}>
          <button 
            onClick={handleSpeak}
            style={{
              background: isSpeaking ? '#fee2e2' : '#f1f5f9', 
              color: isSpeaking ? '#dc2626' : '#475569',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: 'auto',
              transition: 'all 0.2s'
            }}
          >
            {isSpeaking ? <FaStopCircle /> : <FaVolumeUp />}
            {isSpeaking ? "Stop Reading" : "Read Aloud (High Quality)"}
          </button>

          <p style={{ fontSize: '1.15rem', lineHeight: '1.7', margin: 0, color: '#334155' }}>
            {data.summary}
          </p>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />
      <h4 style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
        Evidence Sources
      </h4>
      
      <div className="sources-grid">
        {data.sources.map((source, idx) => (
          <a key={idx} href={source.link} target="_blank" rel="noreferrer" className="source-card">
            <FaExternalLinkAlt style={{ marginRight: '10px', color: '#94a3b8' }} />
            <div>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                {new URL(source.link).hostname.replace('www.', '')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {source.title.substring(0, 40)}...
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ResultCard;