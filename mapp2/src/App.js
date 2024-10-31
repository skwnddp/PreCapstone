import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import { HashRouter as Router, Route, Routes, Switch } from 'react-router-dom';
import React, { useState, useEffect, Navigate } from 'react';
import logo from './logo.svg';
import Home from './Home';
import Main from './Main';
import './App.css';

function App() {
    //API 키 디렉토리 접근
    //const clientId = process.env.REACT_APP_NAVER_MAP_CLIENT_ID;

    // 네이버 지도 API 스크립트 로드
    useEffect(() => {
      const loadNaverMapScript = () => {
        const script = document.createElement('script');
        script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${data.clientId}';
        script.async = true;
        document.head.appendChild(script);
      };
  
      loadNaverMapScript();
    }, []);

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/Home" />} />  */}
        <Route path="/Home" element={<Home />} />
        <Route path="/Main" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;