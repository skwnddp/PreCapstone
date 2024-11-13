import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Home from './Home';
import Main from './Main';
import Search from './Search';
import './transitions.css'; // 화면 전환 css, npm install react-transition-group 라이브러리 설치

// 애니메이션을 적용하는 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} timeout={500} classNames="fade">
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Home />} />
          {/* <Route path="/Home" element={<Search />} /> */}
          <Route path="/Main" element={<Main />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

// index.js에서 App을 감싸서 애니메이션 추가
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AnimatedRoutes />
    </Router>
  </React.StrictMode>
);

reportWebVitals();