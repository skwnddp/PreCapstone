import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { uploadHansungDataToFirestore } from './firebase'; // Firestore 업로드 함수 가져오기
import Home from './Home';
import Main from './Main';
import Search from './Search';
import './transitions.css'; // 화면 전환 css, npm install react-transition-group 라이브러리 설치
import { AlertContainer } from "./AlertToastify"; // AlertToastify.js 파일 import
// npm install react-toastify --force

const UploadFirestoreData = () => {
  useEffect(() => {
    const uploadData = async () => {
      try {
        await uploadHansungDataToFirestore();
        console.log('Firestore 데이터 업로드 완료');
      } catch (error) {
        console.error('Firestore 데이터 업로드 중 오류 발생:', error);
      }
    };
    uploadData();
  }, []);

  return null; // 화면에 렌더링하지 않음
};

// 애니메이션을 적용하는 컴포넌트
const AnimatedRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1); // 애니메이션 이후 스크롤 초기화

    return () => clearTimeout(timeout);
  }, [location.key]);

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} timeout={500} classNames="fade" unmountOnExit>
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Home />} />
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
      <UploadFirestoreData />
      <AnimatedRoutes />
      <AlertContainer />
    </Router>
  </React.StrictMode>
);