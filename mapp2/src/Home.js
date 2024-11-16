import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import { auth } from './firebase'; // firebase.js에서 auth 객체 가져오기
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
        <button
          className="login-button"
          onClick={isLoggedIn ? handleLogout : toggleLoginForm}
        >
          {isLoggedIn ? 'Logout' : isLoginFormVisible ? 'Cancel' : 'Login'}
        </button>
      </header>

      {/* Main Content Section */}
      <div className="home-content">
        <div className="subtitle">맛집 추천 플랫폼</div>
        <h1 className="title">내맘대로드</h1>

        {/* 로그인 후 사용자 이름 표시 */}
        {isLoggedIn && <h2>환영합니다, {username.split('@')[0]}님!</h2>}

        {/* 로그인 양식 또는 회원가입 양식 보이기 */}
        {isLoginFormVisible || isSignUpFormVisible ? (
          <div className="form-container">
            {isLoginFormVisible ? (
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onSignUpClick={toggleSignUpForm}
              />
            ) : (
              <SignUpForm onLoginSuccess={handleLoginSuccess} />
            )}
          </div>
        ) : isProfileFormVisible && isLoggedIn ? (
          // 프로필 수정 양식이 보일 때
          <ProfileForm onClose={toggleProfileForm} />
        ) : (
          <>
            {/* 메뉴 Section - 로그인 양식이 보이지 않을 때만 표시 */}
            <nav className="menu">
              <button
                className="menu-button"
                onClick={() => handleMenuClick('메뉴추천')}
              >
                메뉴추천
              </button>
              <button
                className="menu-button"
                onClick={() => handleMenuClick('즐겨찾기')}
              >
                즐겨찾기
              </button>
              <button
                className="menu-button"
                onClick={() => handleMenuClick('리뷰 보기')}
              >
                리뷰 보기
              </button>
              <button
                className="menu-button"
                onClick={() => navigate('/Main')}
              >
                임시 버튼 : 메인으로 이동
              </button>
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
              <button type="submit" className="search-button">
                🔍
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// 로그인 양식 컴포넌트
const LoginForm = ({ onLoginSuccess, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(email); // 로그인 성공 후, 이메일을 사용자 이름으로 설정
      setEmail('');
      setPassword('');
    } catch (error) {
      alert('로그인 실패: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" className="form-submit">
        Login
      </button>
      <button type="button" className="form-toggle" onClick={onSignUpClick}>
        회원가입
      </button>
    </form>
  );
};

// 회원가입 양식 컴포넌트
const SignUpForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (password === confirmPassword) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess(email); // 회원가입 성공 후, 이메일을 사용자 이름으로 설정
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        alert('회원가입 실패: ' + error.message);
      }
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <form onSubmit={handleSignUp} className="form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
      />
      <button type="submit" className="form-submit">
        Sign Up
      </button>
    </form>
  );
};

// 프로필 관리(비밀번호 변경) 컴포넌트
const ProfileForm = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        alert('비밀번호가 성공적으로 변경되었습니다.');
        onClose();
      } else {
        alert('로그인한 사용자 정보가 없습니다.');
      }
    } catch (error) {
      alert('비밀번호 변경 실패: ' + error.message);
    }
  };

  return (
    <form className="form">
      <h3>비밀번호 변경</h3>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="현재 비밀번호"
        required
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="새 비밀번호"
        required
      />
      <input
        type="password"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        placeholder="새 비밀번호 확인"
        required
      />
      <button type="button" className="form-submit" onClick={handlePasswordChange}>
        비밀번호 변경
      </button>
      <button type="button" className="form-toggle" onClick={onClose}>
        취소
      </button>
    </form>
  );
};

export default Home;


