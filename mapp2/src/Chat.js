import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { app } from "./firebase"; // firebase.js에서 app 객체 가져오기
import "./Chat.css";
import Info from "./Info";
import { reauthenticateWithCredential } from "firebase/auth";

const db = getFirestore(app); // Firestore 초기화

const Chat = ({ setLocations }) => {
  const mapTextareaRef = useRef(null);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [checkedRestaurants, setCheckedRestaurants] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState([]); // 추가: Info 탭에 전달할 상태
  const [text, setText] = useState("");
  const [images, setImages] = useState([null]); // 여러 이미지를 저장할 배열
  const [hello, setHello] = useState(true); // "웰컴" 메시지 상태를 setHello로 변경
  const chatMessagesRef = useRef(null); // chat-messages div를 참조하는 ref

  // useEffect로 chat-messages 내부 div 요소가 변할 때마다 체크
  useEffect(() => {
    const chatMessagesDiv = chatMessagesRef.current;

    // chat-messages 내에 div 요소가 없으면 hello 메시지 표시
    if (
      chatMessagesDiv &&
      chatMessagesDiv.getElementsByTagName("div").length === 0
    ) {
      setHello(true);
    } else {
      setHello(false); // div가 있으면 hello 메시지 숨김
    }
  }, []); // 첫 렌더링 시 한번만 실행

  // 메시지를 추가하는 함수
  const addMessage = () => {
    const newDiv = document.createElement("div");
    newDiv.textContent = "새로운 메시지";
    chatMessagesRef.current.appendChild(newDiv); // chat-messages에 새로운 div 추가
  };

  // 키워드에 대응하는 이미지 맵
  const imageMap = {
    한성: "/Boogi.png",
    맛집: "/Spoon.png",
    // 추가적인 키워드와 이미지 매핑을 할 수 있습니다
  };

  useEffect(() => {
    // 텍스트에 키워드가 포함되면 해당 키워드에 맞는 이미지를 배열에 추가
    const matchedImages = Object.keys(imageMap)
      .filter((keyword) => text.includes(keyword))
      .map((keyword) => imageMap[keyword]);

    if (matchedImages.length > 0) {
      setImages(matchedImages); // 매칭된 이미지 목록 업데이트
    } else {
      setImages([]); // 매칭된 이미지가 없으면 배열 초기화
    }
  }, [text]);

  const handleChange = (e) => {
    setText(e.target.value); // 텍스트 입력 시 상태 업데이트
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    textareaRef.current.focus();
  }, [messages]);

  const handleSendMessage = async () => {
    setImages([]); // 이미지 숨기기
    setIsLocked(true);
    textareaRef.current.style.height = "36px"; // 채팅창 일단 잠그고 높이 초기화

    if (!userMessage) return;

    const newMessage = {
      sender: "user",
      text: userMessage,
      timestamp: new Date().toLocaleString(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

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

      // 사용자에게 보여줄 이름만 추출
      const restaurantNames = extractedRestaurants.map(
        (restaurant) => restaurant.name
      );
      // return { extractedRestaurants, restaurantNames };

      if (extractedRestaurants.length > 0) {
        document.getElementById("hiddenDiv").value = ""; // 히든 div 값 초기화
        let locations = "";

        extractedRestaurants.forEach((restaurant) => {
          // 위도, 경도를 locations 문자열에 추가
          locations += `${restaurant.latitude}, ${restaurant.longitude}\n`;

          // 위도와 경도 콘솔 출력
          console.log(
            `Latitude: ${restaurant.latitude}, Longitude: ${restaurant.longitude}`
          );
        });

        // textarea의 value에 위치 정보 삽입
        document.getElementById("hiddenLatLng").value = locations;
        setLocations(locations);

        const listDiv = document.getElementById("floatingList");
        while (listDiv.firstChild) {
          listDiv.removeChild(listDiv.firstChild);
        }

        extractedRestaurants.forEach((restaurant) => {
          const containerDiv = document.createElement("div");
          containerDiv.innerHTML = "⭐"; // 이름 앞에 별 추가 (★ 기호 사용)
          containerDiv.style.color = "white";
          containerDiv.style.display = "flex"; // 체크박스와 이름을 한 줄에 정렬
          containerDiv.style.alignItems = "center"; // 수직 정렬
          containerDiv.style.marginBottom = "10px"; // 항목 간 간격 추가

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.style.marginRight = "10px"; // 체크박스와 이름 간 간격

          checkbox.addEventListener("change", async (e) => {
            const isChecked = e.target.checked;
            const restaurantData = {
              name: restaurant.name,
              description: restaurant.description,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            };

            if (isChecked) {
              setCheckedRestaurants((prev) => [...prev, restaurantData]);
              await setDoc(
                doc(collection(db, "favorites"), restaurant.name),
                restaurantData
              );
            } else {
              setCheckedRestaurants((prev) =>
                prev.filter((item) => item.name !== restaurant.name)
              );
            }
          });

          const nameDiv = document.createElement("div");
          nameDiv.textContent = restaurant.name;

          containerDiv.appendChild(checkbox); // 체크박스를 먼저 추가
          containerDiv.appendChild(nameDiv); // 이름 추가
          document.getElementById("hiddenDiv").value += containerDiv.outerHTML; // containerDiv의 전체 HTML을 추가
          // console.log(containerDiv.outerHTML)
          // console.log(containerDiv)
          listDiv.appendChild(containerDiv);
        });
      }

      return extractedRestaurants;
    };

    try {
      // Firestore에서 '한성대' 키워드 감지 및 처리
      if (
        userMessage.includes("한성대") ||
        userMessage.includes("한성대학교")
      ) {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await sleep(1000); // 1초 대기

        const q = query(
          collection(db, "restaurants"), // Firestore의 'restaurants' 컬렉션
          where("tags", "array-contains", "한성대") // 'tags' 필드에서 '한성대' 포함 여부 확인
        );

        const querySnapshot = await getDocs(q);
        const fetchedData = [];

        querySnapshot.forEach((doc) => {
          fetchedData.push(doc.data());
        });

        // 랜덤으로 5개의 데이터 선택
        const shuffledData = fetchedData.sort(() => 0.5 - Math.random()); // 배열을 섞음
        const randomFive = shuffledData.slice(0, 5); // 앞에서 5개 선택

        const resultMessage = {
          sender: "gpt",
          text: randomFive.length
            ? randomFive
                .map((item) => `🍽️ ${item.name}\n📋 ${item.description}`)
                .join("\n\n")
            : "한성대와 관련된 맛집 정보를 찾을 수 없습니다.",
          timestamp: new Date().toLocaleString(),
        };

        setMessages((prevMessages) => [...prevMessages, resultMessage]);
        // Firestore에 검색 기록 저장
        if (randomFive.length > 0) {
          const timestamp = new Date();
          const searchData = {
            results: randomFive.map((restaurant) => ({
              name: restaurant.name,
              description: restaurant.description,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            })),
            timestamp: timestamp.toISOString(),
          };

          try {
            // Firestore에 저장
            await setDoc(
              doc(collection(db, "searchHistory"), Date.now().toString()),
              searchData
            );
            console.log("검색 기록이 Firestore에 저장되었습니다:", searchData);

            // 플로팅 박스 업데이트
            const listDiv = document.getElementById("floatingList");
            while (listDiv.firstChild) {
              listDiv.removeChild(listDiv.firstChild); // 기존 플로팅 박스 초기화
            }

            randomFive.forEach((restaurant) => {
              const containerDiv = document.createElement("div");
              containerDiv.style.display = "flex";
              containerDiv.style.alignItems = "center";
              containerDiv.style.marginBottom = "10px";
              containerDiv.style.color = "white";

              // 체크박스 생성
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.style.marginRight = "10px";

              // 체크박스 이벤트
              checkbox.addEventListener("change", async (e) => {
                const isChecked = e.target.checked;
                const restaurantData = {
                  name: restaurant.name,
                  description: restaurant.description,
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                };

                if (isChecked) {
                  // Firestore에 즐겨찾기 추가
                  setCheckedRestaurants((prev) => [...prev, restaurantData]);
                  await setDoc(
                    doc(collection(db, "favorites"), restaurant.name),
                    restaurantData
                  );
                } else {
                  // Firestore에서 즐겨찾기 삭제
                  setCheckedRestaurants((prev) =>
                    prev.filter((item) => item.name !== restaurant.name)
                  );
                  await deleteDoc(
                    doc(collection(db, "favorites"), restaurant.name)
                  );
                }
              });

              // 이름 표시
              const nameDiv = document.createElement("div");
              nameDiv.textContent = `⭐ ${restaurant.name}`;

              // 수정 필요!!!!!!!!!!!!!!!!!!!!!!
              // 이름 클릭 이벤트 추가
              nameDiv.addEventListener("click", async () => {
                try {
                  console.log(`클릭한 맛집 이름: ${restaurant.name}`); // 클릭된 맛집 이름 출력

                  // Firestore에서 해당 맛집 정보 가져오기
                  const infoQuery = query(
                    collection(db, "restaurants"),
                    where("name", "==", restaurant.name)
                  );

                  const infoSnapshot = await getDocs(infoQuery);

                  const infoData = [];
                  infoSnapshot.forEach((doc) => {
                    infoData.push(doc.data());
                  });

                  // Info 탭에 전달
                  if (infoData.length > 0) {
                    setSelectedInfo([infoData[0]]); // 첫 번째 데이터 전달
                    console.log(`Info 탭에 전달된 데이터:`, infoData[0]); // 전달된 데이터 출력
                  } else {
                    setSelectedInfo([]); // 상태 초기화
                    console.warn(
                      `Firestore에 ${restaurant.name}에 대한 데이터가 없습니다.`
                    ); // 경고 출력
                  }
                } catch (error) {
                  console.error("Info 데이터 가져오기 실패:", error); // 에러 출력
                }
              });

              containerDiv.appendChild(checkbox);
              containerDiv.appendChild(nameDiv);
              listDiv.appendChild(containerDiv);
            });
          } catch (error) {
            console.error("검색 기록 저장 중 오류 발생:", error);
          }
        }
        setIsLocked(false);
        return; // '한성대' 키워드 처리 완료 후 반환
      }

      const GPTKey = process.env.REACT_APP_GPT_KEY;
      let userName = "손님";
      let prompt = `${userName}: ${userMessage}\nGPT:`;

      let isRestaurantRequest = false;

      // '맛집'이라는 단어가 포함된 경우, 추가 프롬프트 설정
      if (userMessage.includes("맛집")) {
        // 필터링 입력값 가져오기
        const filteringInputValue =
          document.querySelector(".filtering-input").value;

        // 프롬프트 설정
        prompt =
          "대한민국에서 " +
          userMessage +
          `, 정확한 위도 경도, 추천 맛집 정보를 아래와 같이 제공해줘:
                - [NAME]맛집명[/NAME]
                - [INFO]간단한 설명[/INFO]
                - [LAT]숫자[/LAT]
                - [LNG]숫자[/LNG]`;

        // 필터링 입력값과 함께 프롬프트에 추가
        if (filteringInputValue && filteringInputValue.trim() !== "") {
          prompt = `${filteringInputValue}` + prompt;
        }

        isRestaurantRequest = true;
        console.log(prompt);
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${GPTKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const rawText =
        response.data.choices[0]?.message?.content?.trim() ||
        "응답을 받지 못했습니다.";

      // '맛집' 관련 요청일 경우에만 [NAME]과 [INFO] 태그를 추출
      let extractedNames;
      if (isRestaurantRequest) {
        const nameInfoMatches = rawText.match(
          /\[NAME\](.*?)\[\/NAME\].*?\[INFO\](.*?)\[\/INFO\]/gs
        );
        const filtering = document.querySelector(".filtering-input").value;
        const cleanfiltering = filtering.replace(/\[|\]/g, ""); // 대괄호 제거

        // filtering 값이 있을 경우에만 문구 추가
        const finalfiltering = cleanfiltering
          ? `😁 좋아 그러면 취향에 맞춰서 \n${cleanfiltering} 맛집을 추천해볼게 \n\n`
          : "";

        if (nameInfoMatches) {
          extractedNames =
            nameInfoMatches
              .map((match) => {
                const [_, name, info] = match.match(
                  /\[NAME\](.*?)\[\/NAME\].*?\[INFO\](.*?)\[\/INFO\]/s
                );
                return `🍽️ ${name.trim()}\n📋 ${info.trim()}`;
              })
              .join("\n\n") || "추천된 맛집이 없습니다.";
          console.log(123);

          // filtering 값이 있을 경우 finalFiltering 포함
          extractedNames = finalfiltering + extractedNames;
        } else {
          extractedNames = "추천된 맛집이 없습니다.";
          console.log(
            "Reach is customElements get by reauthenticateWithCredentia"
          );
        }
      } else {
        extractedNames = rawText; // 일반 질문일 경우 GPT 응답 그대로 출력
        setIsLocked(false);
      }

      const gptMessage = {
        sender: "gpt",
        text: extractedNames,
        timestamp: new Date().toLocaleString(),
      };

      setMessages((prevMessages) => [...prevMessages, gptMessage]);

      // 맛집 관련 요청일 경우에만 parseRestaurants 호출
      if (isRestaurantRequest) {
        const extractedRestaurants = parseRestaurants(rawText);
        setIsLocked(false); // 채팅 잠금 해제

        // Firestore에 검색 결과 저장
        if (extractedRestaurants.length > 0) {
          const timestamp = new Date();
          const searchData = {
            results: extractedRestaurants.map((restaurant) => ({
              name: restaurant.name,
              description: restaurant.description,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            })),
            timestamp: timestamp.toISOString(),
          };

          try {
            // Firestore에 저장
            await setDoc(
              doc(collection(db, "searchHistory"), Date.now().toString()),
              searchData
            );
            console.log("검색 결과가 Firestore에 저장되었습니다:", searchData);
          } catch (error) {
            console.error("Firestore에 데이터 저장 중 오류 발생:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "gpt",
          text: "서버와 연결할 수 없습니다. 다시 시도해 주세요.",
          timestamp: new Date().toLocaleString(),
        },
      ]);
      setIsLocked(false);
    } finally {
      setUserMessage("");
    }
  };

  const memoizedChat = useMemo(
    () => (
      <section className="chat-section">
        <div className="chat-messages">
          {hello ? (
            <div style={{ color: "white" }}>
              <div style={{ marginBottom: "80px" }}></div> {/* 여백을 추가 */}
              <div
                style={{
                  textAlign: "left",
                  fontSize: "28px",
                  color: "rgb(235,59,0)",
                  fontFamily: "'Gugi', sans-serif",
                }}
              >
                <strong>🍴 맞춤형 맛집 플랫폼</strong>
                <br />
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "32px",
                  color: "rgb(235, 59, 0)",
                  fontFamily: "'Gugi', sans-serif",
                }}
              >
                <strong>"내맘대로드" 🍴</strong>
              </div>
              <div style={{ marginBottom: "30px" }}></div> {/* 여백을 추가 */}
              <ul style={{ fontSize: "16px" }}>
                <p>🚩 "한성" 혹은 "맛집" 키워드를 넣어보세요</p>
                <p>🚩 "한성" 은 DB를 통해서 학교 주변의 정확한 맛집 정보를</p>
                <p>🚩 "맛집" 은 GPT를 통해서 전국의 맛집 정보를 알려드려요</p>
                <p>⌨️ 지금 바로 채팅을 시작해보세요</p>
              </ul>
            </div>
          ) : null}
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
                  ? `${message.text}`
                  : `챗봇: ${message.text}`}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            value={userMessage}
            onChange={(e) => {
              const value = e.target.value;
              setUserMessage(value); // setUserMessage 호출 위치 수정
              setText(value);
            }}
            placeholder="'맛집' 키워드를 넣어서 입력해보세요!"
            className="chat-input"
            disabled={isLocked}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (userMessage.trim()) {
                  setUserMessage("응답 중...");
                  handleSendMessage();
                }
              }
              handleChange(e);
            }}
            style={{ resize: "none" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              const newHeight = Math.min(
                150,
                Math.max(40, e.target.scrollHeight)
              );
              e.target.style.height = `${newHeight}px`;
            }}
          />
          {images.map((imageSrc, index) => (
            <div
              id="imageDiv"
              key={index}
              style={{
                opacity: 1,
                transform: "translateY(0)", // 이미지가 나타날 때의 효과
                transition: "opacity 1s ease-in-out, transform 1s ease-in-out", // 전환 효과
                position: "absolute",
                top: "600px", // 이미지가 겹치지 않도록 위치 조정
                left: `${-(80 + index * 40)}px`, // 가운데 정렬
                transform: "translateX(-50%)", // 정확히 가운데 정렬
              }}
            >
              <img
                src={imageSrc} // 동적으로 이미지 URL 변경
                alt="'맛집' 혹은 '한성' 키워드를 입력해보세요"
                style={{
                  width: "150px",
                  height: "150px",
                  display: imageSrc ? "block" : "none", // 이미지가 로드되지 않으면 표시하지 않음
                }}
              />
            </div>
          ))}
          <button className="chat-button" onClick={handleSendMessage}>
            전송
          </button>
        </div>
        <Info infoData={selectedInfo} />
      </section>
    ),
    [messages, userMessage]
  );

  return memoizedChat;
};

export default Chat;
