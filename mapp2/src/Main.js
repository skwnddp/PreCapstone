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
  const [isToggled, setIsToggled] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState([]); // 선택된 옵션들

  const options = Array.from({ length: 20 }, (_, i) => ({
    name: `option${i + 1}`,
  }));

  const [checkboxes, setCheckboxes] = useState(
    options.reduce((acc, option) => ({ ...acc, [option.name]: false }), {})
  );

  const resetCheckboxes = () => {
    // option1부터 option20까지 해제
    const resetState = options.reduce(
      (acc, option) => ({ ...acc, [option.name]: false }),
      {}
    );
    setSelectedOptions([]); // 빈 배열로 초기화
    setCheckboxes(resetState);
    document.getElementById("filtering-input").textContent = "";
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
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

    setCheckboxes((prev) => ({ ...prev, [name]: checked }));
    setSelectedOptions(updatedOptions); // 선택된 옵션들 업데이트
    chatInput.textContent = updatedOptions.join(" "); // 업데이트된 텍스트를 chat-input에 적용
  };

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
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
              width: "100%",
              borderRadius: "20px", // 모서리 둥글게
            }}
          >
            <textarea
              id="filtering-input"
              readOnly
              placeholder="필터링을 선택해보세요!"
              className="filtering-input"
              style={{
                padding: "10px",            // 패딩 추가
                border: "2px solid rgb(235, 59, 0)",    // 테두리 스타일
                borderRadius: "15px",        // 둥근 모서리
                resize: "none",              // 크기 조절 불가능
                width: "95%",                // 가능한 모든 너비 차지
                height: "12px",
                margin: "5px",
                marginTop: "5px",           // 상단 여백 추가
                marginLeft: "5px",          // 좌측 여백 추가
                color: "white",
                backgroundColor: "transparent",  // 배경색 추가
                overflow: "hidden",
                whiteSpace: "nowrap", // 줄 바꿈 방지 (JS에서는 camelCase로 작성)
              }}
            ></textarea>

            <div style={{ display: "flex", gap: "5px", marginLeft: "5px", marginBottom: "5px",}}>
              {[
                { name: "option1", label: "한식 🍚" },
                { name: "option2", label: "중식 🥮" },
                { name: "option3", label: "일식 🍣" },
                { name: "option4", label: "양식 🍕" },
                { name: "option5", label: "배달 가능 🏍️" },
                { name: "option6", label: "포장 가능 🥡" },
              ].map((item) => (
                <label
                  key={item.name}
                  className={`filter-label ${!isToggled ? "disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={checkboxes[item.name]}
                    onChange={handleCheckboxChange}
                    disabled={!isToggled}
                    style={{
                      width: "18px", // 크기 살짝 줄임
                      height: "18px",
                      accentColor: "#4CAF50",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px", // 글자 크기 줄임
                      fontWeight: "bold",
                      color: "#000", // 검은색 글자
                    }}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
              <button
                onClick={resetCheckboxes}
                style={{
                  fontWeight: "bold",
                  marginLeft: "240px",
                  padding: "8px 12px",
                  backgroundColor: "rgb(31, 31, 31)", // DarkGray 색상
                  color: "rgb(235, 59, 0)", // 텍스트 색상 
                  border: "none",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                초기화 ⟳
              </button>
            </div>

            <div style={{ display: "flex", gap: "5px", marginLeft: "5px", marginBottom: "5px" }}>
              {[
                { name: "option10", label: "평점이 높은 😍" },
                { name: "option11", label: "데이트 할만한 💑" },
                { name: "option12", label: "조용한 🤫" },
                { name: "option13", label: "가족끼리 갈만한 👩‍👩‍👧" },
                { name: "option14", label: "낭만적인 🎑" },
              ].map((item) => (
                <label
                  key={item.name}
                  className={`filter-label ${!isToggled ? "disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={checkboxes[item.name]}
                    onChange={handleCheckboxChange}
                    disabled={!isToggled}
                    style={{
                      width: "18px", // 크기 살짝 줄임
                      height: "18px",
                      accentColor: "#4CAF50", // 체크박스 색상
                    }}
                  />
                  <span
                    style={{
                      fontSize: "14px", // 글자 크기 줄임
                      fontWeight: "bold",
                      color: "#000", // 검은색 글자
                    }}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
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
