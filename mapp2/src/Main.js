import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

const Main = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('즐겨찾기');

  const renderTabContent = () => {
    switch (activeTab) {
      case '채팅하기':
        return <div>채팅하기 내용</div>;
      case '즐겨찾기':
        return <div>즐겨찾기 내용</div>;
      case '리뷰보기':
        return <div>리뷰보기 내용</div>;
      case '검색내역':
        return <div>검색내역 내용</div>;
      case '맛집정보':
        return <div>맛집정보 내용</div>;
      default:
        return null;
    }
  };

  useEffect(() => {
    const { naver } = window;

    if (naver) {
      const mapOptions = {
        center: new naver.maps.LatLng(37.5665, 126.9780), // 서울의 위도와 경도
        zoom: 10,
      };

      const map = new naver.maps.Map('map', mapOptions);

      // 마커 추가 예시
      new naver.maps.Marker({
        position: new naver.maps.LatLng(37.5665, 126.9780),
        map,
      });
    }
  }, []);

return (
    <div className="main-container">
      <header className="header">
        <h1>무엇을 먹고 싶으세요?</h1>
        <button className="back-btn" onClick={() => navigate('/Home')}>처음으로</button>
        <button className="login-btn">로그아웃</button>
      </header>

      <nav className="sidebar">
        <div onClick={() => setActiveTab('채팅하기')}>채팅하기</div>
        <div onClick={() => setActiveTab('즐겨찾기')}>즐겨찾기</div>
        <div onClick={() => setActiveTab('리뷰보기')}>리뷰보기</div>
        <div onClick={() => setActiveTab('검색내역')}>검색내역</div>
        <div onClick={() => setActiveTab('맛집정보')}>맛집정보</div>
        <>
            <br></br>
        </>
        <section className="content-section">
            {renderTabContent()}
        </section>
      </nav>


      <section className="map-section">
        <div id="map" className="map">
            테스트
          {/* 네이버 지도가 이 div 안에 로드됨 */}
        </div>
      </section>

      <section className="chat-section">
        <div className="chat-message">
            채팅
        </div>
        <input type="text" placeholder="요구사항을 더 입력해보세요!" className="chat-input" />
      </section>

    </div>
  );
};

export default Main;
