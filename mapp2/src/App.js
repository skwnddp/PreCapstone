import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import Home from './Home';
import Main from './Main';
import './App.css';

function App() {
    // 네이버 지도 API 스크립트 로드
    useEffect(() => {
      const loadNaverMapScript = () => {
        const script = document.createElement('script');
        script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=plu21651xm';
        script.async = true;
        document.head.appendChild(script);
      };
  
      loadNaverMapScript();
    }, []);

  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home/>} />
        <Route path="/Main" element={<Main/>} />
      </Routes>
    </Router>
  );
}

export default App;
