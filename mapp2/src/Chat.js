import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import MapComponent from "./Map";
//npm run build 해야됨

const Chat = ({ setLocations }) => {
  const mapTextareaRef = useRef(null);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLocked, setIsLocked] = useState(false); // 잠금 상태를 관리할 상태 추가
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // textarea에 대한 참조 생성

  // const handleLocationAdd = () => {
  //     // 위치 정보를 부모로 전달
  //     setLocations((prevLocations) => locations);
  // };

  // 새 메시지가 추가될 때마다 스크롤을 아래로 + 자동 포커싱
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    textareaRef.current.focus();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userMessage) return;

    const newMessage = {
      sender: "user",
      text: userMessage,
      timestamp: new Date().toLocaleString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // 함수 선언 (try 블록 외부)
    // 원인 뭔지도 모름 걍 수십번 물어보다가 해결됨
    const parseRestaurants = (rawText) => {
      const restaurantRegex =
        /\[NAME\](.*?)\[\/NAME\].*?\[INFO\](.*?)\[\/INFO\].*?\[LAT\](.*?)\[\/LAT\].*?\[LNG\](.*?)\[\/LNG\]/gs;
      const extractedRestaurants = [];
      let match;

      while ((match = restaurantRegex.exec(rawText)) !== null) {
        const [_, name, description, latitude, longitude] = match;
        extractedRestaurants.push({
          name: name.trim(),
          description: description.trim(),
          latitude: parseFloat(latitude.trim()),
          longitude: parseFloat(longitude.trim()),
        });
      }

      if (extractedRestaurants.length > 0) {
        let locations = ""; // 위치 값을 저장할 변수

        extractedRestaurants.forEach((restaurant) => {
          // (restaurant.latitude, restaurant.longitude)를 문자열로 만들어서 locations에 추가
          locations += `${restaurant.latitude}, ${restaurant.longitude}\n`;
        });

        // textarea의 value에 위치 정보 삽입
        document.getElementById("hiddenLatLng").value = locations; // 'hiddenLatLng'는 textarea의 id로 변경
        // 안되겟다 location 정보를 부모에게 전달하고, 자식인 Map에 보내주면 될까?

        //onLocationChange(locations);
        setLocations(locations); // 부모에 위치 정보 전달

        // floatingList id를 가진 div에 restaurant name을 추가
        const listDiv = document.getElementById("floatingList"); // 'floatingList' div 가져오기
        // 기존의 자식 요소들을 모두 제거
        while (listDiv.firstChild) {
          listDiv.removeChild(listDiv.firstChild);
        }
        extractedRestaurants.forEach((restaurant) => {
          const nameDiv = document.createElement("div"); // 새로운 <div> 요소 생성
          nameDiv.textContent = restaurant.name; // restaurant.name 값을 <div>에 추가
          listDiv.appendChild(nameDiv); // 'floatingList' div에 추가
        }); // if <div> 요소가 잇다면 지우고 다시 그리기 구현
      }

      return extractedRestaurants;
    };

    try {
      setIsLocked(true);
      //일단 잠금
      const GPTKey = process.env.REACT_APP_GPT_KEY;

      let userName = "손님"; // 고정된 사용자명
      let prompt = `${userName}: ${userMessage}\nGPT:`; // 질문 앞에 사용자명 추가
      let isRestaurantRequest = false;

      // 사용자가 맛집 추천을 요청하는 경우에만 특정 메시지 추가
      if (userMessage.includes("맛집")) {
        prompt += `. 여러 맛집을 추천해줘. 각 맛집 정보는 아래와 같이 제공해줘:
                - [NAME]맛집명[/NAME]
                - [INFO]설명[/INFO]
                - [LAT]숫자[/LAT]
                - [LNG]숫자[/LNG]`;
        isRestaurantRequest = true;
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          // max_tokens: 100,  // 응답 길이
          temperature: 0.7, // 창의성 설정
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${GPTKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // GPT의 원본 응답 텍스트를 그대로 가져옴
      const rawText =
        response.data.choices[0]?.message?.content?.trim() ||
        "응답을 받지 못했습니다.";

      // GPT 응답을 그대로 사용자에게 보여주기
      const gptMessage = {
        sender: "gpt",
        text: rawText,
        timestamp: new Date().toLocaleString(),
      };
      setMessages((prevMessages) => [...prevMessages, gptMessage]);

      // 맛집 정보를 파싱
      const extractedRestaurants = parseRestaurants(rawText);

      // 추출된 맛집 정보 로그 출력
      console.log("추출된 맛집 정보:", extractedRestaurants);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        sender: "gpt",
        text: "서버와 연결할 수 없습니다. 다시 시도해 주세요.",
        timestamp: new Date().toLocaleString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLocked(false);
      setUserMessage("");
    }
  };

  // useMemo를 사용하여 Chat 컴포넌트 메모이제이션
  const memoizedChat = useMemo(
    () => (
      <section className="chat-section">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.sender}`}
              style={{ color: message.sender === "user" ? "white" : "pink" }}
            >
              <div
                className="timestamp"
                style={{ fontSize: "0.8em", color: "#888" }}
              >
                {message.timestamp}
              </div>
              <span>
                {message.sender === "user"
                  ? `손님: ${message.text}`
                  : `챗봇: ${message.text}`}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* 자동 스크롤용 참조 */}
        </div>
        <div className="chat-input-container">
          <textarea
            ref={textareaRef} // textarea에 ref 할당
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="'맛집' 키워드를 넣어서 입력해보세요!"
            className="chat-input"
            disabled={isLocked} // 잠금 상태에 따라 비활성화
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 기본 Enter 동작 방지

                // 빈칸이 아니면 메시지 전송
                if (userMessage.trim()) {
                  e.target.style.height = "auto";
                  setUserMessage("응답 중..."); // "응답 중..." 표시
                  handleSendMessage();
                }
              }
            }}
            style={{ resize: "none" }} // 크기 조정 비활성화 및 스크롤 숨기기
            onInput={(e) => {
              // 이전 높이를 초기화하고 콘텐츠에 맞게 조정
              e.target.style.height = "auto";
              e.target.style.height = `${Math.max(
                10,
                e.target.scrollHeight
              )}px`; // 최소 높이 10px로 설정
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            style={{
              width: "50px",
              height: "50px",
              fontSize: "14px",
              //   fontWeight: "bold",
              backgroundColor: "white", // 배경 색상 (원하는 색상으로 변경 가능)
              color: "black", // 글자 색상
              border: "none",
              borderRadius: "8px", // 테두리 둥글게
              cursor: "pointer",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // 그림자 효과
              transition: "transform 0.5s", // 클릭 시 애니메이션 효과
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.9)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            전송
          </button>
        </div>
      </section>
    ),
    [messages, userMessage]
  ); // 의존성 배열에 필요한 상태 추가

  return memoizedChat; // memoizedChat을 반환
};

export default Chat;
