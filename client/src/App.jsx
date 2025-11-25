import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import LiveFeed from './components/LiveFeed';
import { FaShieldAlt } from 'react-icons/fa';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState([]);

  const fetchRecents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/recent');
      setRecents(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchRecents(); }, []);

  const handleSearch = async (claimText, imageFile) => {
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('claim', claimText || ""); 
      if (imageFile) formData.append('image', imageFile);

      const response = await axios.post('http://localhost:3000/api/verify', formData);
      setResult(response.data.result);
      fetchRecents(); 
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  // --- THE FIX: FILTER UNIQUE CLAIMS ---
  // This removes duplicates based on the claim text
  const uniqueRecents = recents.filter((item, index, self) =>
    index === self.findIndex((t) => (
      t.claim.toLowerCase().trim() === item.claim.toLowerCase().trim()
    ))
  );

  // Split the UNIQUE list
  const half = Math.ceil(uniqueRecents.length / 2);
  const leftData = uniqueRecents.slice(0, half);
  const rightData = uniqueRecents.slice(half);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {/* Left Side */}
      <LiveFeed side="left" data={leftData} />
      
      <div className="container">
        <div className="header">
          <h1><FaShieldAlt style={{ marginRight: '10px' }}/>VeriFact</h1>
          <p>The AI-Powered Truth Engine</p>
        </div>
        
        <SearchBar onSearch={handleSearch} isLoading={loading} />
        <ResultCard data={result} />
        
        <div className="footer">
          <p>Powered by Llama 3 & DuckDuckGo • Built for Portfolio</p>
        </div>
      </div>

      {/* Right Side */}
      <LiveFeed side="right" data={rightData} />
    </div>
  );
}

export default App;