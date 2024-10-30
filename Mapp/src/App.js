import React from 'react';
import './App.css'; // App.css 파일 불러오기
import Header from './components/Header'; // Header 컴포넌트 불러오기
import SearchBar from './components/SearchBar'; // SearchBar 컴포넌트 불러오기
import MainButtons from './components/MainButtons'; // MainButtons 컴포넌트 불러오기
import Chatbot from "./chatbot.js"; 
import Cloverbot from './Cloverbot.js';
//import './Cloverbot.css';

function App() {
  return (
    <div className="App">
      <Header />  {/* Header 컴포넌트 */}
      <div className="content">
        <h1>무엇을 먹고 싶으세요?</h1> {/* 메인 텍스트 */}
        <SearchBar />  {/* SearchBar 컴포넌트 */}
        <MainButtons />  {/* MainButtons 컴포넌트 */}
      </div>
      <div>
      <Chatbot />
      <Cloverbot />
    </div>
    </div>
  );
}

export default App;
