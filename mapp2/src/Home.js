import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Home.css';

function Home() {
  const [isLoginFormVisible, setLoginFormVisible] = useState(false); // 로그인 양식 표시 여부
  const [isSignUpFormVisible, setSignUpFormVisible] = useState(false); // 회원가입 양식 표시 여부
  const [isProfileFormVisible, setProfileFormVisible] = useState(false); // 프로필 수정 양식 표시 여부
  const [username, setUsername] = useState(''); // 로그인 후 사용자 이름
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const navigate = useNavigate();

  const toggleLoginForm = () => {
    setLoginFormVisible(!isLoginFormVisible); // 로그인 양식 토글
    setSignUpFormVisible(false); // 회원가입 양식 숨김
    setProfileFormVisible(false); // 프로필 수정 양식 숨김
  };

  const toggleSignUpForm = () => {
    setSignUpFormVisible(!isSignUpFormVisible); // 회원가입 양식 토글
    setLoginFormVisible(false); // 로그인 양식 숨김
    setProfileFormVisible(false); // 프로필 수정 양식 숨김
  };

  const handleLoginSuccess = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    setLoginFormVisible(false); // 로그인 후 양식 숨김
    setSignUpFormVisible(false); // 회원가입 양식도 숨김
  };

  const handleLogout = () => {
    setUsername('');
    setIsLoggedIn(false);
    setLoginFormVisible(false); // 로그인 양식 숨김
    setSignUpFormVisible(false); // 회원가입 양식도 숨김
    setProfileFormVisible(false); // 프로필 수정 양식도 숨김
  };

  const handleMenuClick = (menu) => {
    alert(`${menu} 버튼 클릭!`); // 메뉴 버튼 클릭 시 알림
  };

  const handleSearch = (event) => {
    event.preventDefault(); // 기본 폼 제출 방지
    const searchInput = event.target.search.value; // 검색 입력값 가져오기
    alert(`Searching for: ${searchInput}`); // 검색어 표시
  };

  const toggleProfileForm = () => {
    setProfileFormVisible(!isProfileFormVisible); // 프로필 수정 양식 토글
    setLoginFormVisible(false); // 로그인 양식 숨김
    setSignUpFormVisible(false); // 회원가입 양식 숨김
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <button className="profile-button" onClick={toggleProfileForm}>
          👤 {/* 회원정보 아이콘 */}
        </button>
        <button className="login-button" onClick={isLoggedIn ? handleLogout : toggleLoginForm}>
          {isLoggedIn ? "Logout" : (isLoginFormVisible ? "Cancel" : "Login")}
        </button>
      </header>

      {/* Main Content Section */}
      <div className="home-content">
        <div className="subtitle">맛집 추천 플랫폼</div>
        <h1 className="title">내맘데로드</h1>

        {/* 로그인 후 사용자 이름 표시 */}
        {isLoggedIn && <h2>환영합니다, {username}님!</h2>}

        {/* 로그인 양식 또는 회원가입 양식 보이기 */}
        {(isLoginFormVisible || isSignUpFormVisible) ? (
          <div className="form-container">
            {isLoginFormVisible ? (
              <LoginForm onLoginSuccess={handleLoginSuccess} onSignUpClick={toggleSignUpForm} />
            ) : (
              <SignUpForm onLoginSuccess={handleLoginSuccess} />
            )}
          </div>
        ) : isProfileFormVisible && isLoggedIn ? (
          // 프로필 수정 양식이 보일 때
          <ProfileForm username={username} onUsernameChange={setUsername} onClose={toggleProfileForm} />
        ) : (
          <>
            {/* 메뉴 Section - 로그인 양식이 보이지 않을 때만 표시 */}
            <nav className="menu">
              <button className="menu-button" onClick={() => handleMenuClick('메뉴추천')}>메뉴추천</button>
              <button className="menu-button" onClick={() => handleMenuClick('즐겨찾기')}>즐겨찾기</button>
              <button className="menu-button" onClick={() => handleMenuClick('리뷰 보기')}>리뷰 보기</button>
              <button className="menu-button" onClick={() => navigate('/Main')}>임시 버튼 : 메인으로 이동</button>
            </nav>

            {/* 검색 Section - 로그인 양식이 보이지 않을 때만 표시 */}
            <form className="search-container" onSubmit={handleSearch}>
              <button className="hamburger">☰</button>
              <input 
                type="text" 
                name="search" 
                className="search-input" 
                placeholder="한성대 입구역 근처 삼겹살집 추천해줘" 
              />
              <button type="submit" className="search-button">🔍</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// 로그인 양식 컴포넌트
const LoginForm = ({ onLoginSuccess, onSignUpClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault(); // 기본 폼 제출 방지
    onLoginSuccess(username); // 로그인 성공 시 사용자 이름 전달
    setUsername('');
    setPassword('');
  };

  return (
    <form onSubmit={handleLogin} className="form">
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username" 
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password" 
        required 
      />
      <button type="submit" className="form-submit">Login</button>
      <button type="button" className="form-toggle" onClick={onSignUpClick}>회원가입</button> {/* 회원가입 버튼 */}
    </form>
  );
};

// 회원가입 양식 컴포넌트
const SignUpForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    
    if (pwd.length < minLength || !hasNumber.test(pwd) || !hasLetter.test(pwd)) {
      setPasswordError('8자 이상, 숫자, 영어 조합');
    } else {
      setPasswordError('');
    }
  };

  const handleSignUp = (event) => {
    event.preventDefault(); // 기본 폼 제출 방지
    if (password === confirmPassword) {
      if (!passwordError) {
        onLoginSuccess(username); // 회원가입 후 사용자 이름 전달
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        alert("비밀번호 조건을 만족하지 않습니다."); // 비밀번호 조건 불충족 시 경고
      }
    } else {
      alert("비밀번호가 일치하지 않습니다."); // 비밀번호 불일치 시 경고
    }
  };

  return (
    <form onSubmit={handleSignUp} className="form">
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username" 
        required 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => {
          setPassword(e.target.value);
          validatePassword(e.target.value); // 비밀번호 검증
        }} 
        placeholder="Password" 
        required 
      />
      {passwordError && <div className="error">{passwordError}</div>}
      <input 
        type="password" 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
        placeholder="Confirm Password" 
        required 
      />
      <button type="submit" className="form-submit">회원가입</button>
    </form>
  );
};

// 프로필 수정 컴포넌트
const ProfileForm = ({ username, onUsernameChange, onClose }) => {
  const [newUsername, setNewUsername] = useState(username);

  const handleProfileUpdate = (event) => {
    event.preventDefault();
    onUsernameChange(newUsername); // 새로운 사용자 이름으로 업데이트
    onClose(); // 양식 닫기
  };

  return (
    <form onSubmit={handleProfileUpdate} className="form">
      <h2>회원 정보 수정</h2>
      <input 
        type="text" 
        value={newUsername} 
        onChange={(e) => setNewUsername(e.target.value)} 
        placeholder="새로운 사용자 이름" 
        required 
      />
      <button type="submit" className="form-submit">수정 완료</button>
      <button type="button" className="form-toggle" onClick={onClose}>닫기</button> {/* 닫기 버튼 */}
    </form>
  );
};

export default Home;