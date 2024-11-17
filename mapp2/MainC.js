import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { initMap } from './Map';
// import { loadNaverMapScript } from './Map';
import { MapComponent } from "./Map";
import Map from "./Map";
import Chat from "./Chat";
import Favorites from "./Favorites";
import Review from "./Review";
import History from "./History";
import Info from "./Info";
import "./Main.css";

const Main = () => {
  // let map; // 지도를 전역으로 선언
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("채팅하기");
  const [locations, setLocations] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]); // 선택된 옵션들

  const handleCheckboxChange = (event) => {
    const chatInput = document.querySelector(".filtering-input");
    if (!chatInput) return;

    const label = event.target.closest("label"); // 체크박스의 부모 <label> 요소
    const keyword = label ? label.textContent.trim() : "";

    let updatedOptions;
    if (event.target.checked) {
      // 체크된 경우 keyword 추가
      updatedOptions = [...selectedOptions, keyword];
    } else {
      // 체크 해제된 경우 keyword 제거
      updatedOptions = selectedOptions.filter((option) => option !== keyword);
    }

    setSelectedOptions(updatedOptions); // 선택된 옵션들 업데이트
    chatInput.textContent = updatedOptions.join(" "); // 업데이트된 텍스트를 chat-input에 적용
  };

  // `Chat`에서 받은 `location`을 업데이트하는 함수
  const handleLocationUpdate = (newLocation) => {
    setLocations(newLocation);
  };
  console.log(setLocations);

  const memoizedChat = useMemo(
    () => <Chat onLocationChange={handleLocationUpdate} />,
    []
  );

  // textarea의 상태 관리
  const [text, setText] = useState("");

  // Chat.js에서 받은 텍스트를 textarea에 업데이트하는 함수
  const updateText = (newText) => {
    setText((prevText) => prevText + "\n" + newText); // 이전 텍스트에 추가
  };

  const extractedRestaurants = [];

  // const renderTabContent 삭제
  // 렌더링이 매번 되는 이슈 > 부모 Main에서 관리하던가 따로 손봐줘야 돼서 귀찮아짐 > 썡 div 생성

  return (
    <div className="main-container">
      <header className="header">
        <button className="back-btn" onClick={() => navigate('/Home')}>처음으로</button>
        <button className="login-btn">로그인 / 로그아웃</button>
      </header>
      <nav className="navbar">
        <button className="menu-button-home" ><b>내맘대로드</b></button>
        <button className="menu-button">메뉴추천</button>
        <button className="menu-button">즐겨찾기</button>
        <button className="menu-button">리뷰 보기</button>
        <button className="menu-button">메인으로 이동</button>
      </nav>

      <div>
        <nav className="sidebar">
          <div
            className={activeTab === "채팅하기" ? "active-tab" : ""}
            onClick={() => setActiveTab("채팅하기")}
          >
            채팅하기
          </div>
          <div
            className={activeTab === "즐겨찾기" ? "active-tab" : ""}
            onClick={() => setActiveTab("즐겨찾기")}
          >
            즐겨찾기
          </div>
          <div
            className={activeTab === "리뷰보기" ? "active-tab" : ""}
            onClick={() => setActiveTab("리뷰보기")}
          >
            리뷰보기
          </div>
          <div
            className={activeTab === "검색내역" ? "active-tab" : ""}
            onClick={() => setActiveTab("검색내역")}
          >
            검색내역
          </div>
          <div
            className={activeTab === "맛집정보" ? "active-tab" : ""}
            onClick={() => setActiveTab("맛집정보")}
          >
            맛집정보
          </div>
          <>
            <br></br>
          </>
        </nav>
        <section className="content-section">
          {/* {renderTabContent()} */}
          {/* 각 탭의 내용을 항상 렌더링하되, visible 상태로 표시 */}
          <div
            style={{
              display: activeTab === "채팅하기" ? "block" : "none",
              whiteSpace: "pre-wrap",
              fontSize: "14px",
            }}
          >
            <Chat
              extractedRestaurants={extractedRestaurants}
              updateText={updateText}
              setLocations={setLocations}
            />
          </div>
          <div style={{ display: activeTab === "즐겨찾기" ? "block" : "none" }}>
            <Favorites />
          </div>
          <div style={{ display: activeTab === "리뷰보기" ? "block" : "none" }}>
            <Review />
          </div>
          <div style={{ display: activeTab === "검색내역" ? "block" : "none" }}>
            <History />
          </div>
          <div style={{ display: activeTab === "맛집정보" ? "block" : "none" }}>
            <Info />
          </div>
        </section>
        <textarea
          readOnly
          placeholder="필터링을 선택해보세요!"
          className="filtering-input"
          style={{
            padding: "10px",            // 패딩 추가
            border: "1px solid #ccc",    // 테두리 스타일
            borderRadius: "10px",        // 둥근 모서리
            resize: "none",              // 크기 조절 불가능
            width: "80%",                // 가능한 모든 너비 차지
            height: "16px",
            maxHeight: "30px",          // 최대 높이 설정
            marginTop: "10px",           // 상단 여백 추가
            marginLeft: "7px",          // 좌측 여백 추가
            color: "black",
            backgroundColor: "white",  // 배경색 추가
          }}
        ></textarea>
      </div>

      {/* 지도를 아래에 배치해야 오버레이 잘 보임 */}
      <section className="map-section">
        <label>
          <input
            style={{ width: "16px", height: "16px" }}
            type="checkbox"
            name="option1"
            onChange={handleCheckboxChange}
          />{" "}
          [한식 맛집]
        </label>
        <label>
          <input
            type="checkbox"
            name="option2"
            onChange={handleCheckboxChange}
          />{" "}
          [분위기 좋은]
        </label>
        <label>
          <input
            type="checkbox"
            name="option2"
            onChange={handleCheckboxChange}
          />{" "}
          [배달 가능]
        </label>
        {/* {memoizedChat} */}
        <Map locatiosn={locations} />
      </section>
      {/* <textarea id='hiddenLatLng'>테스트</textarea> */}
    </div>
  );
};

export default Main;
