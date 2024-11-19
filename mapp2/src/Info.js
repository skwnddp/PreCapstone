import React from "react";

function Info({ infoData }) {
  if (!infoData || infoData.length === 0) {
    return <p>선택된 맛집 정보가 없습니다.</p>;
  }

  return (
    <div className="chat-messages">
      <h2>맛집 정보</h2>
      <ul>
        {infoData.map((info) => (
          <li key={info.id}>
            <h3>{info.name}</h3>
            <p>{info.description}</p>
            <p>평점: {info.rating} / 5</p>
            <p>주소: {info.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Info;
