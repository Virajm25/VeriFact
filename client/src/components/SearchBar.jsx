import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaImage, FaTimes } from 'react-icons/fa';

const SearchBar = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (isLoading) return;
    // Pass both text and image to the parent handler
    onSearch(input, image);
  };

  return (
    <div className="search-box">
      {/* Image Preview Area */}
      {preview && (
        <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
          <img 
            src={preview} 
            alt="Upload Preview" 
            style={{ height: '80px', borderRadius: '12px', border: '2px solid #e2e8f0' }} 
          />
          <button 
            onClick={clearImage}
            style={{
              position: 'absolute', top: '-10px', right: '-10px',
              background: '#ef4444', color: 'white', borderRadius: '50%',
              width: '24px', height: '24px', padding: '0', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', fontSize: '12px', margin: 0
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      <textarea 
        placeholder={image ? "Image selected. Add context if needed..." : "Paste a rumor, headline, or upload a screenshot..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }} 
        />

        {/* Image Upload Button */}
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{ width: 'auto', background: '#e0e7ff', color: '#4338ca' }}
          title="Upload Screenshot"
        >
          <FaImage size={20} />
        </button>

        {/* Submit Button */}
        <button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Verify Fact'}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;