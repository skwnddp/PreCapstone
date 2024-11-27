import React, { useState, useEffect, useRef, useContext } from "react";
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
import Neon from "./Neon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./AlertToastify"
import useDarkMode from "use-dark-mode"; // 다크 모드

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
  const [isTyping, setIsTyping] = useState(false); // 타이핑 중 여부 상태
  const [isDarkMode, setIsDarkMode] = useState(true); // 다크모드 기본값
  const darkMode = useDarkMode(true); // 기본값: 다크모드 활성화(true)
  const [showAnimation, setShowAnimation] = useState(false);

  const categories = [
    { name: "치킨", emoji: "🍗" },
    { name: "한식", emoji: "🍚" },
    { name: "디저트", emoji: "🍰" },
    { name: "중식", emoji: "🥡" },
    { name: "분식", emoji: "🍢" },
    { name: "샐러드", emoji: "🥗" },
    { name: "회 초밥", emoji: "🍣" },
    { name: "버거", emoji: "🍔" },
    { name: "일식", emoji: "🍱" },
    { name: "양식", emoji: "🍕" },
    { name: "고기", emoji: "🥩" },
    { name: "찜 탕", emoji: "🍲" },
    { name: "족발 보쌈", emoji: "🐷" },
  ];

  const handleAnimationEnd = () => {
    // 카테고리에서 랜덤으로 하나 선택
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // 랜덤 카테고리 텍스트와 이모지 조합 + "맛집 추천해줄래" 추가
    const searchInput = `${randomCategory.name} ${randomCategory.emoji} 맛집 추천해줄래`;

    // `textarea`에 값 설정
    if (textareaRef.current) {
      textareaRef.current.value = searchInput;
    }

    // 결과를 넘기기
    navigate("/Main", { state: { searchInput } });

    setShowAnimation(false); // 애니메이션 종료
  };

  // // 색상 밝기를 계산하는 함수 (Luminance 계산)
  // const calculateLuminance = (r, g, b) => {
  //   return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // };

  // // HEX 색상에서 RGB로 변환
  // const hexToRgb = (hex) => {
  //   let r, g, b;
  //   if (hex[0] === "#") {
  //     hex = hex.slice(1);
  //   }
  //   if (hex.length === 3) {
  //     hex = hex.split("").map((x) => x + x).join("");
  //   }
  //   r = parseInt(hex.slice(0, 2), 16);
  //   g = parseInt(hex.slice(2, 4), 16);
  //   b = parseInt(hex.slice(4, 6), 16);
  //   return { r, g, b };
  // };

  // // RGB 색상에서 Luminance 값 계산 후 어두운 색인지 판단
  // const isBlackOrDarkColor = (color) => {
  //   const rgb = color.match(/\d+/g); // rgb 값을 추출
  //   if (rgb && rgb.length === 3) {
  //     const [r, g, b] = rgb.map(Number);
  //     const luminance = calculateLuminance(r, g, b);
  //     return luminance < 50; // Luminance가 50 미만이면 검은색 또는 어두운 색
  //   }
  //   return false;
  // };

  // // const [isDarkMode, setIsDarkMode] = useState(true); // 기본 다크모드 상태
  // const [originalStyles, setOriginalStyles] = useState({}); // 원본 스타일 저장
  // // 버튼 클릭 시 색상 변경

  // // 첫 렌더링 후 모든 스타일을 저장
  // useEffect(() => {
  //   const elements = document.querySelectorAll("*"); // 모든 요소 선택
  //   const styles = {};

  //   elements.forEach((element) => {
  //     // 각 요소의 스타일을 가져옵니다.
  //     const computedStyle = window.getComputedStyle(element);
  //     const backgroundColor = computedStyle.backgroundColor;
  //     const color = computedStyle.color;
  //     const backgroundImage = computedStyle.backgroundImage;
  //     const borderColor = computedStyle.borderColor;

  //     // 스타일을 저장합니다.
  //     styles[element] = {
  //       backgroundColor,
  //       color,
  //       backgroundImage,
  //       borderColor
  //     };
  //   });

  //   setOriginalStyles(styles); // 원본 스타일 저장
  // }, []); // 첫 렌더링 시 한 번만 실행

  // // 다크모드 / 라이트모드 변경 시 처리
  // useEffect(() => {
  //   const elements = document.querySelectorAll("*"); // 모든 요소 선택

  //   elements.forEach((element) => {
  //     const { backgroundColor, color, backgroundImage, borderColor } = originalStyles[element] || {};

  //     if (isDarkMode) {
  //       // 다크모드: 원래 색상으로 복원
  //       if (backgroundColor) element.style.backgroundColor = backgroundColor;
  //       if (color) element.style.color = color;
  //       if (backgroundImage) element.style.backgroundImage = backgroundImage;
  //       if (borderColor) element.style.borderColor = borderColor;
  //     } else {
  //       // 라이트모드: 검은색 계열 색상만 변경
  //       if (isBlackOrDarkColor(backgroundColor) || isBlackOrDarkColor(color)) {
  //         element.style.backgroundColor = "#ecf0f1"; // 라이트모드 배경색
  //         element.style.color = "#2c3e50"; // 라이트모드 텍스트 색상
  //         if (backgroundImage) element.style.backgroundImage = ""; // 그라디언트도 초기화
  //       }
  //     }
  //   });
  // }, [isDarkMode, originalStyles]); // isDarkMode 또는 originalStyles가 변경될 때마다 실

  // // 테마 전환 함수
  // const toggleTheme = () => {
  //   setIsDarkMode((prevMode) => !prevMode);
  // };

  const handleAuthNavigation = (navigate, path, state = {}) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (isLoggedIn) => {
      if (isLoggedIn) {
        navigate(path, { state }); // 로그인 상태면 경로와 함께 state 전달
      } else {
        alert("로그인을 먼저 해주세요"); // 비로그인 상태 경고
      }
    });
  };

  const TextEffect = () => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [index, setIndex] = useState(0); // 텍스트 인덱스 상태
    const [isDeleting, setIsDeleting] = useState(false); // 삭제 상태
    const [isPaused, setIsPaused] = useState(false); // 일시정지 상태
    const [cursorVisible, setCursorVisible] = useState(true); // 커서 가시성 상태

    const texts = [
      "😍 한성대 근처 맛집 알려줄래",
      "🌆 서울에서 괜찮은 일식 맛집 알려줄래",
      "🍝 성수역 근처에서 데이트하기 좋은 맛집 알려줄래",
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
        navigate("/Home"); // 로그아웃 이후 새로고침
      })
      .catch((error) => {
        // 로그아웃 중 오류 처리
        console.error("로그아웃 실패:", error);
      });
  };

  // const handleMenuClick = (menu) => {
  //   alert(`${menu} 버튼 클릭!`); // 메뉴 버튼 클릭 시 알림
  // };

  const handleRndSearch = (event) => {
    if (!isLoggedIn) {
      alert("로그인을 먼저 해주세요!");
      return;
    }
    setShowAnimation(true); // 애니메이션 시작
  };

  const handleSearch = (event) => {
    if (!isLoggedIn) {
      alert('로그인을 먼저 해주세요!');
      event.preventDefault();
      return;
    }

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
    if (!isLoggedIn) {
      alert('로그인을 먼저 해주세요!');
      return;
    }
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
      alert("현재 비밀번호가 일치하지 않아요");
    }
  };

  // 새 비밀번호 변경 함수
  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않아요");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인된 사용자가 없어요");

      // 새 비밀번호를 설정하는 함수
      await updatePassword(user, newPassword);
      alert("비밀번호가 성공적으로 변경되었어요!");
      toggleProfileForm(); // 비밀번호 변경 후 양식 닫기
    } catch (error) {
      alert("비밀번호 변경에 실패했어요... " + error.message);
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
          onClick={() => handleRndSearch()}
        >메뉴추천
        </button>
        {showAnimation && (
          <div
            className="animation-container"
            onAnimationEnd={handleAnimationEnd}
          >
            {categories.map((category, index) => (
              <span
                key={index}
                style={{ animationDelay: `${index * 0.1}s` }} // 딜레이 설정
              >{category.emoji}
              </span>
            ))}
          </div>
        )}
        <button
          className="menu-button"
          onClick={() => handleAuthNavigation(navigate, "/Main", { activeTab: "즐겨찾기" })}
        >즐겨찾기
        </button>
        <button
          className="menu-button"
          onClick={() => handleAuthNavigation(navigate, "/Main", { activeTab: "리뷰보기" })}
        >리뷰보기
        </button>
        {/* <button className="menu-button" onClick={() => navigate("/Main")}>
          메인으로 이동
        </button> */}

        {/* vunalnc setIsDarkMode dmdk..vunalnc etIsDarkMode dmdk..   */}

        {/* 라이트, 다크 모드 토글 버튼 */}
        <div className={isDarkMode ? "" : "light-mode"}>
          {/* 다크모드/라이트모드 상태에 따라 클래스를 변경 */}
          <div style={{ marginLeft: "500pt", display: "flex", alignItems: "center", gap: "10px" }}>

            {/* <button onClick={toggleTheme}>
              Toggle to {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button> */}

            {/* <span style={{ color: "white", fontSize: "18pt" }}>☀︎</span>
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
            <span style={{ color: "white", fontSize: "18pt" }}>☾</span> */}

          </div>
        </div>

        <button className="profile-button" onClick={toggleProfileForm}>
          프로필
        </button>
        <button
          className="login-button"
          onClick={isLoggedIn ? handleLogout : toggleLoginForm}
        >
          {isLoggedIn ? "로그아웃" : isLoginFormVisible ? "취소" : "로그인"}
        </button>
      </nav>

      {/* Main Content Section */}
      <div className="home-content">
        <div className="subtitle">맛집 추천 플랫폼</div>
        <Neon><h1 className="title">내맘대로드</h1></Neon>

        {/* 로그인 후 사용자 이름 표시 */}
        <h2 style={{ color: "white", fontFamily: "Noto Sans KR", fontWeight: 400, fontSize: "20px" }}>
          {isLoggedIn
            ? username && username.split("@")[0] // username이 있을 경우 처리
              ? `환영해요, ${username.split("@")[0]}님!`
              : "유저 이름을 불러오는데 실패했어요... 새로고침을 해보세요 😂" // username이 없을 경우 로직
            : "어서오세요! 지금 바로 로그인을 해보세요"}
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
            <h2 style={{ color: "rgb(235,60,0" }}>프로필 관리</h2>
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
                  <span style={{ color: "rgb(235,60,0)", fontWeight: "bold" }}>
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
                  <span style={{ fontWeight: "bold", color: "rgb(235,60,0" }}>
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
            <FontAwesomeIcon icon={faSearch} style={{ fontSize: "24px", color: "rgb(235,60,0)", marginLeft: 10, marginRight: 20 }} />
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
              채팅하기
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
  const navigate = useNavigate();

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
      navigate("/Home"); // 로그인 이후 새로고침 및 메인 이동 방지

    } catch (error) {
      alert("로그인에 실패했어요... " + error.message);
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
        <span style={{ color: "rgb(235,60,0", fontWeight: "bold" }}>
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
      alert("비밀번호가 일치하지 않아요");
      return;
    }

    const auth = getAuth(); // Firebase auth 객체 가져오기

    try {
      // 이메일 중복 확인
      const methods = await fetchSignInMethodsForEmail(auth, email); // 이메일로 등록된 방법 확인
      if (methods.length > 0) {
        alert("이미 가입된 이메일이에요");
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
      alert("회원가입에 실패했어요... " + error.message);
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
        <span style={{ fontWeight: "bold", color: "rgb(235,60,0" }}>
          회원가입 완료
        </span>
      </button>
    </form>
  );
};

export default Home;
