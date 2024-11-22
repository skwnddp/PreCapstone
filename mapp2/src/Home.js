import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
  updatePassword,
} from "firebase/auth";
import { auth } from "./firebase"; // firebase.js에서 auth 객체 가져오기
import "./Home.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

function Home() {
  const [isLoginFormVisible, setLoginFormVisible] = useState(false); // 로그인 양식 표시 여부
  const [isSignUpFormVisible, setSignUpFormVisible] = useState(false); // 회원가입 양식 표시 여부
  const [isProfileFormVisible, setProfileFormVisible] = useState(false); // 프로필 수정 양식 표시 여부
  const [username, setUsername] = useState(""); // 로그인 후 사용자 이름
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [currentPassword, setCurrentPassword] = useState(""); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // 새 비밀번호 확인
  const [isPasswordVerified, setIsPasswordVerified] = useState(false); // 현재 비밀번호 확인 여부
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // 타이핑 중 여부 상태

  const TextEffect = () => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [index, setIndex] = useState(0); // 텍스트 인덱스 상태
    const [isDeleting, setIsDeleting] = useState(false); // 삭제 상태
    const [isPaused, setIsPaused] = useState(false); // 일시정지 상태
    const [cursorVisible, setCursorVisible] = useState(true); // 커서 가시성 상태

    const texts = [
      "😍 한성대 근처 맛집 알려줘",
      "🌆서울에서 괜찮은 맛집 알려줘",
      "🍝 건대역 근처에서 데이트하기 좋은 맛집 알려줄래",
      "❄ 국내에서 겨울에 놀러갈만한 분위기 좋은 맛집을 찾아줘",
    ]; // 여러 텍스트 배열

    useEffect(() => {
      const currentText = texts[currentTextIndex];
      let timer;

      // 타이핑 효과 로직
      if (!isDeleting && index < currentText.length) {
        timer = setInterval(() => {
          setIndex((prevIndex) => prevIndex + 1);
        }, 120); // 텍스트 타이핑 속도 간격
      } else if (isDeleting && index > 0) {
        timer = setInterval(() => {
          setIndex((prevIndex) => prevIndex - 1);
        }, 60); // 삭제 속도 간격
      } else if (index === currentText.length && !isPaused) {
        setIsPaused(true); // 텍스트 다 쓰고 대기 시작
        setTimeout(() => {
          setIsDeleting(true); // 일정 시간 후 삭제 시작
        }, 1500); // 1.5초 동안 대기
      } else if (index === 0 && isDeleting) {
        setIsDeleting(false);
        setIsPaused(false); // 삭제 후 일시정지 상태 초기화
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length); // 다음 텍스트로 이동
      }

      // 커서 깜빡임 효과
      const cursorTimer = setInterval(() => {
        if (index === currentText.length) {
          setCursorVisible((prev) => !prev); // 텍스트가 끝난 후에만 커서 깜빡이게 설정
        }
      }, 200); // 간격마다 깜빡임 토글

      return () => {
        clearInterval(timer);
        clearInterval(cursorTimer); // 컴포넌트 언마운트 시 타이머 정리
      };
    }, [currentTextIndex, index, isDeleting, isPaused]); // 의존성 배열 추가

    // 텍스트를 문자 단위로 잘라서 커서 표시 처리
    return (
      <div>
        <div style={{ display: "inline" }}>
          {Array.from(texts[currentTextIndex]).slice(0, index).join("")}{" "}
          {/* 텍스트 문자 단위로 출력 */}
        </div>
        <div
          style={{
            display: "inline",
            visibility: cursorVisible ? "visible" : "hidden",
          }}
        >
          {" |"} {/* 커서만 따로 표시 */}
        </div>
      </div>
    );
  };

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
    signOut(auth)
      .then(() => {
        // 성공적으로 로그아웃됨
        console.log("로그아웃 성공");
        // 상태 초기화
        setUsername("");
        setIsLoggedIn(false);
        setLoginFormVisible(false);
        setSignUpFormVisible(false);
        setProfileFormVisible(false);
        setIsPasswordVerified(false);
      })
      .catch((error) => {
        // 로그아웃 중 오류 처리
        console.error("로그아웃 실패:", error);
      });
  };

  const handleMenuClick = (menu) => {
    alert(`${menu} 버튼 클릭!`); // 메뉴 버튼 클릭 시 알림
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const searchInput = document.querySelector(".search-input").value;

    if (!searchInput) {
      alert("검색어를 입력하세요!");
      return;
    }

    // 자식 컴포넌트에서 전달된 ref를 사용
    if (textareaRef.current) {
      textareaRef.current.value = searchInput;
    }

    console.log(searchInput);

    navigate("/Main", { state: { searchInput } });
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
      await signInWithEmailAndPassword(auth, email, currentPassword); // 로그인 상태 확인
      alert("비밀번호 인증 성공!");
      setIsPasswordVerified(true); // 비밀번호 확인 완료
      setCurrentPassword("");
    } catch (error) {
      alert("현재 비밀번호가 일치하지 않습니다.");
    }
  };

  // 새 비밀번호 변경 함수
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인된 사용자가 없습니다.");

      // 새 비밀번호를 설정하는 함수
      await updatePassword(user, newPassword);
      alert("비밀번호가 성공적으로 변경되었습니다.");
      toggleProfileForm(); // 비밀번호 변경 후 양식 닫기
    } catch (error) {
      alert("비밀번호 변경 실패: " + error.message);
    }
  };

  // Firebase에서 로그인 상태 확인 및 변경
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email); // 로그인한 사용자 이름 또는 이메일을 설정
        setIsLoggedIn(true); // 로그인 상태 true로 설정
      } else {
        setUsername("");
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
        <button className="menu-button-home" onClick={() => navigate("/Home")}>
          <b>내맘대로드</b>
        </button>
        <button
          className="menu-button"
          onClick={() => handleMenuClick("메뉴추천")}
        >
          메뉴추천
        </button>
        <button
          className="menu-button"
          onClick={() => handleMenuClick("즐겨찾기")}
        >
          즐겨찾기
        </button>
        <button
          className="menu-button"
          onClick={() => handleMenuClick("리뷰 보기")}
        >
          리뷰 보기
        </button>
        <button className="menu-button" onClick={() => navigate("/Main")}>
          메인으로 이동
        </button>

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

        <button className="profile-button" onClick={toggleProfileForm}>
          프로필
        </button>
        <button
          className="login-button"
          onClick={isLoggedIn ? handleLogout : toggleLoginForm}
        >
          {isLoggedIn ? "로그아웃" : isLoginFormVisible ? "Cancel" : "로그인"}
        </button>
      </nav>

      {/* Main Content Section */}
      <div className="home-content">
        <div className="subtitle">맛집 추천 플랫폼</div>
        <h1 className="title">내맘대로드</h1>

        {/* 로그인 후 사용자 이름 표시 */}
        <h2 style={{ color: "white" }}>
          {isLoggedIn
            ? username && username.split("@")[0] // username이 있을 경우 처리
              ? `어서오세요, ${username.split("@")[0]}님!`
              : "유저 이름을 불러오는데 실패했어요... 새로고침을 해보세요 😂" // username이 없을 경우 로직
            : "환영합니다! 지금 바로 로그인을 해보세요"}
        </h2>

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
                  <span style={{ color: "rgb(235,59,0)", fontWeight: "bold" }}>
                    확인
                  </span>
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
                  <span style={{ fontWeight: "bold", color: "rgb(235,59,0" }}>
                    비밀번호 변경
                  </span>
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
              onFocus={() => setIsTyping(true)} // 포커스 시 타이핑 상태 설정
              // onBlur={() => setIsTyping(false)}  // 포커스 벗어날 시 타이핑 상태 해제
            />
            {!isTyping && ( // 타이핑 중일 때는 TextEffect 숨기기
              <div
                style={{
                  color: "white",
                  fontSize: "20px",
                  position: "absolute",
                  left: "50%", // 수평 가운데
                  transform: "translateX(-50%)", // 요소의 가운데를 기준으로 이동
                }}
              >
                <TextEffect />
              </div>
            )}
            <button type="submit" className="search-button">
              챗봇으로 이동
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// 로그인 양식 컴포넌트
const LoginForm = ({ onLoginSuccess, onSignUpClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    const auth = getAuth(); // Firebase auth 객체 가져오기

    try {
      // 로그인 시도
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 로그인 성공
      onLoginSuccess(user.displayName); // 사용자 이름을 설정

      setEmail("");
      setPassword("");
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
      <button type="submit" className="form-submit">
        <span style={{ color: "rgb(235,59,0", fontWeight: "bold" }}>
          로그인
        </span>
      </button>
      <button type="button" className="form-toggle" onClick={onSignUpClick}>
        <span style={{ fontWeight: "bold" }}>회원가입</span>
      </button>
    </form>
  );
};

// 회원가입 양식 컴포넌트
const SignUpForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 사용자 이름 설정
      await updateProfile(user, {
        displayName: email.split("@")[0], // 예: 이메일 앞부분을 이름으로 설정
      });

      onLoginSuccess(user.displayName); // 설정된 사용자 이름으로 로그인 처리
      setEmail("");
      setPassword("");
      setConfirmPassword("");
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
      <button type="submit" className="form-submit">
        <span style={{ fontWeight: "bold", color: "rgb(235,59,0" }}>
          회원가입 완료
        </span>
      </button>
    </form>
  );
};

export default Home;
