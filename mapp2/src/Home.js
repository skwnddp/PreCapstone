import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, updateProfile, updatePassword } from 'firebase/auth';
import { auth } from './firebase';  // firebase.js에서 auth 객체 가져오기
import './Home.css';
import { onAuthStateChanged } from 'firebase/auth';

function Home() {
  const [isLoginFormVisible, setLoginFormVisible] = useState(false); // 로그인 양식 표시 여부
  const [isSignUpFormVisible, setSignUpFormVisible] = useState(false); // 회원가입 양식 표시 여부
  const [isProfileFormVisible, setProfileFormVisible] = useState(false); // 프로필 수정 양식 표시 여부
  const [username, setUsername] = useState(''); // 로그인 후 사용자 이름
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [currentPassword, setCurrentPassword] = useState(''); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(''); // 새 비밀번호
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // 새 비밀번호 확인
  const [isPasswordVerified, setIsPasswordVerified] = useState(false); // 현재 비밀번호 확인 여부
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLiteDarkToggle = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.style.backgroundColor = isDarkMode ? "#fff" : "#333";
    document.body.style.color = isDarkMode ? "#000" : "#fff";
  };

  const toggleLoginForm = () => {
    setLoginFormVisible(!isLoginFormVisible); // 로그인 양식 토글
    setSignUpFormVisible(false); // 회원가입 양식 숨김
    setProfileFormVisible(false); // 프로필 수정 양식 숨김
    setIsPasswordVerified(false); // 비밀번호 확인 초기화
  };

  const toggleSignUpForm = () => {
    setSignUpFormVisible(!isSignUpFormVisible); // 회원가입 양식 토글
    setLoginFormVisible(false); // 로그인 양식 숨김
    setProfileFormVisible(false); // 프로필 수정 양식 숨김
    setIsPasswordVerified(false); // 비밀번호 확인 초기화
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
    setIsPasswordVerified(false); // 비밀번호 확인 초기화
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

  // 현재 비밀번호 확인 함수
  const verifyCurrentPassword = async () => {
    try {
      const email = auth.currentUser.email; // 현재 로그인된 사용자의 이메일
      await signInWithEmailAndPassword(auth, email, currentPassword);  // 로그인 상태 확인
      alert('비밀번호 인증 성공!');
      setIsPasswordVerified(true); // 비밀번호 확인 완료
      setCurrentPassword('');
    } catch (error) {
      alert('현재 비밀번호가 일치하지 않습니다.');
    }
  };

  // 새 비밀번호 변경 함수
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('로그인된 사용자가 없습니다.');

      // 새 비밀번호를 설정하는 함수
      await updatePassword(user, newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다.');
      toggleProfileForm(); // 비밀번호 변경 후 양식 닫기
    } catch (error) {
      alert('비밀번호 변경 실패: ' + error.message);
    }
  };

  // Firebase에서 로그인 상태 확인 및 변경
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email); // 로그인한 사용자 이름 또는 이메일을 설정
        setIsLoggedIn(true); // 로그인 상태 true로 설정
      } else {
        setUsername('');
        setIsLoggedIn(false); // 로그아웃 상태로 설정
      }
    });

    // 클린업 함수 (컴포넌트가 언마운트될 때 구독 취소)
    return () => unsubscribe();
  }, []); // 빈 배열로 마운트 시 한 번만 실행되도록 설정

  return (
    <div className="home-container">
      {/* Navigation Bar Section */}
      <nav className="navbar">
        <button className="menu-button-home" onClick={() => navigate('/Home')}><b>내맘대로드</b></button>
        <button className="menu-button" onClick={() => handleMenuClick('메뉴추천')}>메뉴추천</button>
        <button className="menu-button" onClick={() => handleMenuClick('즐겨찾기')}>즐겨찾기</button>
        <button className="menu-button" onClick={() => handleMenuClick('리뷰 보기')}>리뷰 보기</button>
        <button className="menu-button" onClick={() => navigate('/Main')}>메인으로 이동</button>
        
        {/* 라이트, 다크 모드 토글 버튼 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🌞</span>
          <div
            onClick={handleLiteDarkToggle}
            style={{
              width: "50px",
              height: "25px",
              background: isDarkMode ? "#333" : "#ccc",
              borderRadius: "15px",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "50%",
                left: isDarkMode ? "26px" : "4px",
                transform: "translateY(-50%)",
                transition: "left 0.3s",
              }}
            ></div>
          </div>
          <span>🌙</span>
        </div>
        
        <button className="profile-button" onClick={toggleProfileForm}>프로필</button>
        <button className="login-button" onClick={isLoggedIn ? handleLogout : toggleLoginForm}>
          {isLoggedIn ? "로그아웃" : (isLoginFormVisible ? "Cancel" : "로그인")}
        </button>
      </nav>

      {/* Main Content Section */}
      <div className="home-content">
        <div className="subtitle">맛집 추천 플랫폼</div>
        <h1 className="title">내맘대로드</h1>

        {/* 로그인 후 사용자 이름 표시 */}
        <h2 style={{ color: 'white' }}>환영합니다, {isLoggedIn ? (username ? username.split('@')[0] : 'Unknown') : ''}님!</h2>

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
          // 프로필 수정 양식
          <div className="profile-form-container">
            <h2 style={{ color: "rgb(235,59,0" }}>프로필 관리</h2>
            {/* 현재 비밀번호 확인 */}
            {!isPasswordVerified ? (
              <form className="form">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  required
                />
                <button
                  type="button"
                  className="form-submit"
                  onClick={verifyCurrentPassword}
                >
                  <span style={{ color: "rgb(235,59,0)", fontWeight: "bold" }}>확인</span>
                </button>
              </form>
            ) : (
              // 새 비밀번호 변경
              <form className="form">
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
                <button
                  type="button"
                  className="form-submit"
                  onClick={handlePasswordChange}
                >
                  <span style={{ fontWeight: "bold", color: "rgb(235,59,0" }}>비밀번호 변경</span>
                </button>
                <button
                  type="button"
                  className="form-toggle"
                  onClick={toggleProfileForm}
                >
                  <span style={{ fontWeight: "bold" }}>취소</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          <form className="search-container" onSubmit={handleSearch}>
            <button className="hamburger">☰</button>
            <input
              type="text"
              name="search"
              className="search-input"
              placeholder="검색"
            />
            <button type="submit" className="search-button">검색하기</button>
          </form>
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
    const auth = getAuth(); // Firebase auth 객체 가져오기

    try {
      // 로그인 시도
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 로그인 성공
      onLoginSuccess(user.displayName); // 사용자 이름을 설정

      setEmail('');
      setPassword('');
    } catch (error) {
      alert("로그인 실패: " + error.message);
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
        placeholder="비밀번호"
        required
      />
      <button type="submit" className="form-submit"><span style={{ color: "rgb(235,59,0", fontWeight: "bold" }}>로그인</span></button>
      <button type="button" className="form-toggle" onClick={onSignUpClick}><span style={{ fontWeight: "bold" }}>회원가입</span></button>
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
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const auth = getAuth(); // Firebase auth 객체 가져오기

    try {
      // 이메일 중복 확인
      const methods = await fetchSignInMethodsForEmail(auth, email); // 이메일로 등록된 방법 확인
      if (methods.length > 0) {
        alert("이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.");
        return;
      }

      // 회원가입 진행
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 사용자 이름 설정
      await updateProfile(user, {
        displayName: email.split('@')[0], // 예: 이메일 앞부분을 이름으로 설정
      });

      onLoginSuccess(user.displayName); // 설정된 사용자 이름으로 로그인 처리
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert("회원가입 실패: " + error.message);
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
        placeholder="비밀번호"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="비밀번호 재입력"
        required
      />
      <button type="submit" className="form-submit"><span style={{ fontWeight: "bold", color: "rgb(235,59,0" }}>회원가입 완료</span></button>
    </form>
  );
};

export default Home;