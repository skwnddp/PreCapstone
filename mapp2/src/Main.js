import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// import { initMap } from './Map';
// import { loadNaverMapScript } from './Map'; dd
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
  const [isToggled, setIsToggled] = useState(true);

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

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
    <main className="main-container">
      <header className="header">

        {/* <div>
          <h1>내맘대로드</h1>
          <h4>지피티와 네이버 지도를 활용한 맞춤형 맛집 플랫폼</h4>
        </div> */}

        <nav className="navbar">
          <button className="menu-button-home" onClick={() => navigate('/Home')}><b>내맘대로드</b></button>
          <button className="menu-button">메뉴추천</button>
          <button className="menu-button">즐겨찾기</button>
          <button className="menu-button">리뷰 보기</button>
          <button className="menu-button">메인으로 이동</button>
          <button className="login-btn">로그아웃</button>
        </nav>
        {/* <button className="back-btn" onClick={() => navigate('/Home')}>처음으로</button> */}
        
      </header>

      {/* 탭, 챗봇, 필터링, 지도 */}
      <body className="chatmap-container">
        <section className="sidebar-container">
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
        </section>

        {/* 지도를 아래에 배치해야 오버레이 잘 보임 */}
        <section className="map-container">
          <div
            style={{
              margin: "5px",
              padding: "5px 5px",
              border: "1px solid #ccc", // 구분선 추가
              width: "100%",
              borderRadius: "20px", // 모서리 둥글게
            }}
          >
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
                height: "12px",
                margin: "5px",
                marginTop: "5px",           // 상단 여백 추가
                marginLeft: "5px",          // 좌측 여백 추가
                color: "black",
                backgroundColor: "white",  // 배경색 추가
                overflow: "hidden"
              }}
            ></textarea>

            {/* 필터링 1행 */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              <label><input
                // style={{ width: "16px", height: "16px" }}
                type="checkbox"
                name="option1"
                onChange={handleCheckboxChange}
                disabled={!isToggled} // 토글 상태에 따라 비활성화
              />{" "}
                [한식 맛집]</label><label>
                <input
                  // style={{ width: "16px", height: "16px" }}
                  type="checkbox"
                  name="option2"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [중식 맛집]</label> <label>
                <input
                  // style={{ width: "16px", height: "16px" }}
                  type="checkbox"
                  name="option3"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [일식 맛집]</label><label>
                <input
                  // style={{ width: "16px", height: "16px" }}
                  type="checkbox"
                  name="option4"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [양식 맛집]</label>
            </div>

            {/* 필터링 2행 */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  name="option10"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [평점이 높은]</label><label>
                <input
                  type="checkbox"
                  name="option11"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [데이트 할만한]</label><label>
                <input
                  type="checkbox"
                  name="option11"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [조용한]</label><label>
                <input
                  type="checkbox"
                  name="option11"
                  onChange={handleCheckboxChange}
                  disabled={!isToggled} // 토글 상태에 따라 비활성화
                />{" "}
                [가족끼리 갈만한]</label>
            </div>

            {/* 필터링 3행 */}
            {/* <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
            <label>
              <input
                type="checkbox"
                name="option20"
                onChange={handleCheckboxChange}
                disabled={!isToggled} // 토글 상태에 따라 비활성화
              />{" "}
              [배달 가능]
            </label>
          </div> */}

          </div>
          {/* {memoizedChat} */}
          {/* <Map locatiosn={locations} /> */}
          <div className="map"><Map /></div>
        </section >
        {/* <textarea id='hiddenLatLng'>테스트</textarea> */}
      </body>
    </main >
  );
};

export default Main;
