import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadNaverMapScript } from './Map';
import Chat from './Chat';
import './Main.css';

const Main = () => {

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('채팅하기');

  const renderTabContent = () => {
    switch (activeTab) {
      case '채팅하기':
        return (
          <Chat />
          //채팅 컴포넌트
        )
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

  //네이버 지도 로드
  useEffect(() => {
    const cleanup = loadNaverMapScript();
    return cleanup; // 컴포넌트가 언마운트될 때 스크립트 정리
  })

  return (
    <div className="main-container">
      <header className="header">
        <h1>무엇을 먹고 싶으세요?</h1>
        <button className="back-btn" onClick={() => navigate('/Home')}>처음으로</button>
        <button className="login-btn">로그아웃</button>
      </header>

      <div>
        <nav className="sidebar">
          <div onClick={() => setActiveTab('채팅하기')}>채팅하기</div>
          <div onClick={() => setActiveTab('즐겨찾기')}>즐겨찾기</div>
          <div onClick={() => setActiveTab('리뷰보기')}>리뷰보기</div>
          <div onClick={() => setActiveTab('검색내역')}>검색내역</div>
          <div onClick={() => setActiveTab('맛집정보')}>맛집정보</div>
          <>
            <br></br>
          </>
        </nav>
        <section className="content-section">
          {renderTabContent()}
        </section>
      </div>

      <section className="map-section">
        <div id="map" className="map">
          지도 보이는지 테스트
          {/* 네이버 지도가 이 div 안에 로드됨 */}
          <div style={{ position: 'absolute', top: '100px', left: '100px', fontSize: '24px' }}>
            🌟
          </div>
          {/* 맵 오버레이 아이콘 */}
        </div>
      </section>
    </div>
  );
};

export default Main;