import React, { useState } from "react";

function History() {
  const [searches, setSearches] = useState([]);
  const [input, setInput] = useState("");

  // 검색어 추가
  const addSearch = () => {
    if (input.trim() === "") return; // 빈 값은 추가하지 않음
    setSearches([...searches, input]);
    setInput("");
  };

  // 검색어 삭제
  const clearHistory = () => {
    setSearches([]);
  };

  return (
    <div>
      <h2>검색 내역</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="검색어 입력"
      />
      <button onClick={addSearch}>추가</button>
      <button onClick={clearHistory}>내역 지우기</button>
      
      <ul>
        {searches.length === 0 ? (
          <li>검색 내역이 없습니다.</li>
        ) : (
          searches.map((search, index) => (
            <li key={index}>{search}</li>
          ))
        )}
      </ul>
    </div>
  );
}

export default History;