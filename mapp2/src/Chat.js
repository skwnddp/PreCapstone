import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { app } from './firebase'; // firebase.js에서 app 객체 가져오기

const db = getFirestore(app); // Firestore 초기화

const Chat = ({ setLocations }) => {
    const mapTextareaRef = useRef(null);
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [checkedRestaurants, setCheckedRestaurants] = useState([]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        textareaRef.current.focus();
    }, [messages]);

    const handleSendMessage = async () => {
        setIsLocked(true);
        if (!userMessage) return;

        const newMessage = {
            sender: 'user',
            text: userMessage,
            timestamp: new Date().toLocaleString(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        const parseRestaurants = (rawText) => {
            const restaurantRegex = /\[NAME\](.*?)\[\/NAME\].*?\[INFO\](.*?)\[\/INFO\].*?\[LAT\](.*?)\[\/LAT\].*?\[LNG\](.*?)\[\/LNG\]/gs;
            const extractedRestaurants = [];
            let match;

            while ((match = restaurantRegex.exec(rawText)) !== null) {
                const [_, name, description, latitude, longitude] = match;
                extractedRestaurants.push({
                    name: name.trim(),
                    description: description.trim(),
                    latitude: parseFloat(latitude.trim()),
                    longitude: parseFloat(longitude.trim())
                });
            }

            // 사용자에게 보여줄 이름만 추출
            const restaurantNames = extractedRestaurants.map(restaurant => restaurant.name);
            // return { extractedRestaurants, restaurantNames };

            if (extractedRestaurants.length > 0) {
                let locations = "";

                extractedRestaurants.forEach((restaurant) => {
                    // 위도, 경도를 locations 문자열에 추가
                    locations += `${restaurant.latitude}, ${restaurant.longitude}\n`;

                    // 위도와 경도 콘솔 출력
                    console.log(`Latitude: ${restaurant.latitude}, Longitude: ${restaurant.longitude}`);
                });

                // textarea의 value에 위치 정보 삽입
                document.getElementById('hiddenLatLng').value = locations;
                setLocations(locations);

                const listDiv = document.getElementById('floatingList');
                while (listDiv.firstChild) {
                    listDiv.removeChild(listDiv.firstChild);
                }

                extractedRestaurants.forEach((restaurant) => {
                    const containerDiv = document.createElement('div');
                    containerDiv.innerHTML = '⭐'; // 이름 앞에 별 추가 (★ 기호 사용)
                    containerDiv.style.display = 'flex'; // 체크박스와 이름을 한 줄에 정렬
                    containerDiv.style.alignItems = 'center'; // 수직 정렬
                    containerDiv.style.marginBottom = '10px'; // 항목 간 간격 추가

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.style.marginRight = '10px'; // 체크박스와 이름 간 간격

                    checkbox.addEventListener('change', async (e) => {
                        const isChecked = e.target.checked;
                        const restaurantData = {
                            name: restaurant.name,
                            description: restaurant.description,
                            latitude: restaurant.latitude,
                            longitude: restaurant.longitude,
                        };

                        if (isChecked) {
                            setCheckedRestaurants((prev) => [...prev, restaurantData]);
                            await setDoc(doc(collection(db, "favorites"), restaurant.name), restaurantData);
                        } else {
                            setCheckedRestaurants((prev) => prev.filter((item) => item.name !== restaurant.name));
                        }
                    });

                    const nameDiv = document.createElement('div');
                    nameDiv.textContent = restaurant.name;

                    containerDiv.appendChild(checkbox); // 체크박스를 먼저 추가
                    containerDiv.appendChild(nameDiv); // 이름 추가
                    document.getElementById('hiddenDiv').value += containerDiv.outerHTML; // containerDiv의 전체 HTML을 추가
                    console.log(containerDiv.outerHTML)
                    console.log(containerDiv)
                    listDiv.appendChild(containerDiv);
                });
            }

            return extractedRestaurants;
        };

        try {
            const GPTKey = process.env.REACT_APP_GPT_KEY;
            let userName = "손님";
            let prompt = `${userName}: ${userMessage}\nGPT:`;

            let isRestaurantRequest = false;

            // '맛집'이라는 단어가 포함된 경우, 추가 프롬프트 설정
            if (userMessage.includes('맛집')) {
                // 필터링 입력값 가져오기
                const filteringInputValue = document.querySelector('.filtering-input').value;

                // 프롬프트 설정
                prompt = `추천 맛집 정보는 아래와 같이 제공해줘:
                - [NAME]맛집명[/NAME]
                - [INFO]간단한 설명[/INFO]
                - [LAT]숫자[/LAT]
                - [LNG]숫자[/LNG]`;

                // 필터링 입력값과 함께 프롬프트에 추가
                prompt += `맛집 분위기는 ${filteringInputValue}`;
                console.log(prompt)

                isRestaurantRequest = true;
            }

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o',
                    temperature: 0.7,
                    messages: [{ role: 'user', content: prompt }],
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GPTKey}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const rawText = response.data.choices[0]?.message?.content?.trim() || '응답을 받지 못했습니다.';

            // '맛집' 관련 요청일 경우에만 [NAME]과 [INFO] 태그를 추출
            let extractedNames;
            if (isRestaurantRequest) {
                const nameInfoMatches = rawText.match(/\[NAME\](.*?)\[\/NAME\].*?\[INFO\](.*?)\[\/INFO\]/gs);

                if (nameInfoMatches) {
                    extractedNames = nameInfoMatches
                        .map(match => {
                            const [_, name, info] = match.match(/\[NAME\](.*?)\[\/NAME\].*?\[INFO\](.*?)\[\/INFO\]/s);
                            return `🍽️ ${name.trim()}\n📋 ${info.trim()}`;
                        })
                        .join('\n\n') || '추천된 맛집이 없습니다.';
                    console.log(123)
                } else {
                    extractedNames = '추천된 맛집이 없습니다.';
                    console.log(456)
                }
            } else {
                extractedNames = rawText; // 일반 질문일 경우 GPT 응답 그대로 출력
            }

            const gptMessage = {
                sender: 'gpt',
                text: extractedNames,
                timestamp: new Date().toLocaleString(),
            };

            setMessages((prevMessages) => [...prevMessages, gptMessage]);

            // 맛집 관련 요청일 경우에만 parseRestaurants 호출
            if (isRestaurantRequest) {
                parseRestaurants(rawText);
            }
        }
        catch (error) {
            console.error('Error sending message:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'gpt', text: '서버와 연결할 수 없습니다. 다시 시도해 주세요.', timestamp: new Date().toLocaleString() },
            ]);
        } finally {
            setIsLocked(false);
            setUserMessage('');
        }
    };

    const memoizedChat = useMemo(() => (
        <section className="chat-section">
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender}`} style={{ color: message.sender === 'user' ? 'white' : 'pink' }}>
                        <div className="timestamp" style={{ fontSize: '0.8em', color: '#888' }}>
                            {message.timestamp}
                        </div>
                        <span>{message.sender === 'user' ? `손님: ${message.text}` : `챗봇: ${message.text}`}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
                <textarea
                    ref={textareaRef}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="'맛집' 키워드를 넣어서 입력해보세요!"
                    className="chat-input"
                    disabled={isLocked}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (userMessage.trim()) {
                                setUserMessage("응답 중...");
                                handleSendMessage();
                            }
                        }
                    }}
                    style={{ resize: 'none' }}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        const newHeight = Math.min(150, Math.max(40, e.target.scrollHeight));
                        e.target.style.height = `${newHeight}px`;
                    }}
                />
                <button class="chat-button" onClick={handleSendMessage}>전송</button>
            </div>
        </section>
    ), [messages, userMessage]);

    return memoizedChat;
};

export default Chat;