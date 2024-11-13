import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// import { initMap } from './Map';
// import { loadNaverMapScript } from './Map';
import { MapComponent } from './Map';
import Map from './Map';
import Chat from './Chat';
import Favorites from './Favorites';
import Review from './Review';
import History from './History';
import Info from './Info';
import './Main.css';

const Main = () => {
  // let map; // 지도를 전역으로 선언
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('채팅하기');
  const [locations, setLocations] = useState('');

  // `Chat`에서 받은 `location`을 업데이트하는 함수
  const handleLocationUpdate = (newLocation) => {
    setLocations(newLocation);
  };
  console.log(setLocations); 

  const memoizedChat = useMemo(() => <Chat onLocationChange={handleLocationUpdate} />, []);

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
        <h1>내맘대로드</h1>
        <button className="back-btn" onClick={() => navigate('/Home')}>처음으로</button>
        <button className="login-btn">로그인 / 로그아웃</button>
      </header>

      <div>
        <nav className="sidebar">
          <div
            className={activeTab === '채팅하기' ? 'active-tab' : ''}
            onClick={() => setActiveTab('채팅하기')}
          >
            채팅하기
          </div>
          <div
            className={activeTab === '즐겨찾기' ? 'active-tab' : ''}
            onClick={() => setActiveTab('즐겨찾기')}
          >
            즐겨찾기
          </div>
          <div
            className={activeTab === '리뷰보기' ? 'active-tab' : ''}
            onClick={() => setActiveTab('리뷰보기')}
          >
            리뷰보기
          </div>
          <div
            className={activeTab === '검색내역' ? 'active-tab' : ''}
            onClick={() => setActiveTab('검색내역')}
          >
            검색내역
          </div>
          <div
            className={activeTab === '맛집정보' ? 'active-tab' : ''}
            onClick={() => setActiveTab('맛집정보')}
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
          <div style={{
            display: activeTab === '채팅하기' ? 'block' : 'none',
            whiteSpace: 'pre-wrap',
            fontSize: '14px'
          }}>
            <Chat extractedRestaurants={extractedRestaurants} updateText={updateText} setLocations={setLocations} />
          </div>
          <div style={{ display: activeTab === '즐겨찾기' ? 'block' : 'none' }}>
            <Favorites />
          </div>
          <div style={{ display: activeTab === '리뷰보기' ? 'block' : 'none' }}>
            <Review />
          </div>
          <div style={{ display: activeTab === '검색내역' ? 'block' : 'none' }}>
            <History />
          </div>
          <div style={{ display: activeTab === '맛집정보' ? 'block' : 'none' }}>
            <Info />
          </div>
        </section>
      </div >

      {/* 지도를 아래에 배치해야 오버레이 잘 보임 */}
      <section className="map-section">
        <label>
          <input style={{ width: "16px", height: "16px" }} type="checkbox" name="option1" /> 한식 맛집
        </label>____
        <label>
          <input type="checkbox" name="option1" /> 분위기 좋은
        </label>____
        <label>
          <input type="checkbox" name="option1" /> 배달 가능
        </label>____
        {/* {memoizedChat} */}
        <Map locatiosn={locations} />
      </section>
      {/* <textarea id='hiddenLatLng'>테스트</textarea> */}
    </div >
  );
};

export default Main;