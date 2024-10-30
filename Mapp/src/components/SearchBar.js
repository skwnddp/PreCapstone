import React, { useState } from 'react';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    console.log(`Searching for: ${searchTerm}`);
  };

  return (
    <div className="search-bar">
      <input 
        type="text" 
        value={searchTerm} 
        onChange={handleInputChange} 
        placeholder="한성대 입구역 근처 삼겹살" 
      />
      <button onClick={handleSearch}>
        <i className="fa fa-search"></i>
      </button>
    </div>
  );
}

export default SearchBar;
