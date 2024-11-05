import React from "react";

const infoList = [
  {
    id: 1,
    name: "맛있는 집",
    description: "정통 한식, 건강한 재료로 만든 요리",
    rating: 4.5,
    address: "서울특별시 강남구 맛집로 1",
  },
  {
    id: 2,
    name: "피자 천국",
    description: "신선한 재료로 만든 다양한 피자",
    rating: 4.8,
    address: "서울특별시 마포구 피자길 2",
  },
  {
    id: 3,
    name: "스시 명가",
    description: "일본식 초밥 전문점, 신선한 해산물",
    rating: 4.7,
    address: "서울특별시 종로구 스시로 3",
  },
];

function Info() {
  return (
    <div>
      <h2>맛집 정보</h2>
      <ul>
        {infoList.map((info) => (
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
