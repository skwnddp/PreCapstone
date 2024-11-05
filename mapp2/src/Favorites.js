import React, { useState } from "react";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [input, setInput] = useState("");

  // 즐겨찾기 추가
  const addFavorite = () => {
    if (input.trim() === "") return; // 빈 값은 추가하지 않음
    setFavorites([...favorites, input]);
    setInput("");
  };

  // 즐겨찾기 제거
  const removeFavorite = (index) => {
    setFavorites(favorites.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>즐겨찾기 목록</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="아이템 추가"
      />
      <button onClick={addFavorite}>추가</button>
      <ul>
        {favorites.map((item, index) => (
          <li key={index}>
            {item} <button onClick={() => removeFavorite(index)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;