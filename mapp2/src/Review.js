import React, { useState } from "react";

function Review() {
  const [reviews, setReviews] = useState([]);
  const [input, setInput] = useState("");
  const [rating, setRating] = useState(5);

  // 리뷰 추가
  const addReview = () => {
    if (input.trim() === "") return; // 빈 값은 추가하지 않음
    const newReview = { text: input, rating: rating };
    setReviews([...reviews, newReview]);
    setInput("");
    setRating(5);
  };

  return (
    <div>
      <h2>리뷰 목록</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="리뷰 작성"
      />
      <div>
        <label>평점: </label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      <button onClick={addReview}>추가</button>
      
      <ul>
        {reviews.length === 0 ? (
          <li>리뷰가 없습니다.</li>
        ) : (
          reviews.map((review, index) => (
            <li key={index}>
              <strong>평점: {review.rating} / 5</strong>
              <p>{review.text}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Review;