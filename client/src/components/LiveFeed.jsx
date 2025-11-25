import React from 'react';

const LiveFeed = ({ data, side }) => {
  if (!data || data.length === 0) return null;

  const loopData = [...data, ...data]; // Duplicate for infinite loop effect

  return (
    <div className={`feed-column ${side === 'left' ? 'feed-left' : 'feed-right'}`}>
      <div className="feed-track">
        {loopData.map((item, index) => {
          let status = "mini-misleading";
          if (item.verdict.toLowerCase().includes('true')) status = "mini-true";
          if (item.verdict.toLowerCase().includes('false')) status = "mini-false";

          // FIX: Calculate percentage if it's a decimal
          const confidenceDisplay = item.confidence <= 1 
            ? Math.round(item.confidence * 100) 
            : item.confidence;

          return (
            <div key={index} className={`feed-card ${status}`}>
              <h4>"{item.claim.substring(0, 50)}..."</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span className="verdict">{item.verdict}</span>
                <span style={{ color: '#64748b' }}>{confidenceDisplay}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveFeed;