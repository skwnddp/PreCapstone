import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Home.css';

const Home = () => {
  const navigate = useNavigate(); 
  
  return (
    <div className="home-container">
      <header className="home-header">
        <>
        <span className="profile-icon">😁프로필</span>
        <button className="login-button">로그인</button>
        </>
      </header>

      <div className="home-content">
        <h2 className="subtitle">맛집 추천 플랫폼</h2>
        <h1 className="title">무엇을 먹고 싶으세요?</h1>

        <div className="menu">
          <button className="menu-button" onClick={() => navigate('/Main')}>메뉴 추천</button>
          <button className="menu-button" onClick={() => navigate('/Main')}>즐겨찾기</button>
          <button className="menu-button" onClick={() => navigate('/Main')}>리뷰 보기</button>
        </div>

        <div className="search-container">
          <button className="hamburger">☰</button>
          <input
            type="text"
            placeholder="한성대 입구역 근처 삼겹살집 추천해줘"
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>
    </div>
  );
};

export default Home;