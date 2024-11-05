import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
//npm run build 해야됨

const Chat = () => {
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLocked, setIsLocked] = useState(false); // 잠금 상태를 관리할 상태 추가
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null); // textarea에 대한 참조 생성

    // 새 메시지가 추가될 때마다 스크롤을 아래로 + 자동 포커싱
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        textareaRef.current.focus();
    }, [messages]);

    const handleSendMessage = async () => {
        setIsLocked(true);
        //일단 잠금

        if (!userMessage) return;

        const newMessage = {
            sender: 'user',
            text: userMessage,
            timestamp: new Date().toLocaleString(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
            const GPTKey = process.env.REACT_APP_GPT_KEY;
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4o',
                messages: [{ role: 'user', content: userMessage }],
            }, {
                headers: {
                    'Authorization': `Bearer ${GPTKey}`,
                    'Content-Type': 'application/json',
                },
            });
            // 응답 포맷팅 왜 안됨
            const rawText = response.data.choices[0]?.message?.content?.trim() || '응답을 받지 못했습니다.';
            const formattedText = rawText
                .split('\n') // 줄 바꿈으로 나누기
                .map(line => line.trim()) // 각 줄 앞뒤 공백 제거
                .filter(line => line) // 빈 줄 제거
                .join('\n'); // 다시 줄 바꿈으로 합치기

            const gptMessage = {
                sender: 'gpt',
                text: formattedText, // 포맷팅된 텍스트 사용
                timestamp: new Date().toLocaleString(),
            };
            setMessages((prevMessages) => [...prevMessages, gptMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                sender: 'gpt',
                text: '서버와 연결할 수 없습니다. 다시 시도해 주세요.',
                timestamp: new Date().toLocaleString(),
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setIsLocked(false);
            setUserMessage('');
        }
    };

    // useMemo를 사용하여 Chat 컴포넌트 메모이제이션
    const memoizedChat = useMemo(() => (
        <section className="chat-section">
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender}`}>
                        <div className="timestamp" style={{ fontSize: '0.8em', color: '#888' }}>
                            {message.timestamp}
                        </div>
                        <span>{message.text}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} /> {/* 자동 스크롤용 참조 */}
            </div>
            <div className="chat-input-container">
                <textarea
                    ref={textareaRef} // textarea에 ref 할당
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="요구사항을 더 입력해보세요!"
                    className="chat-input"
                    disabled={isLocked} // 잠금 상태에 따라 비활성화
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // 기본 Enter 동작 방지

                            // 빈칸이 아니면 메시지 전송
                            if (userMessage.trim()) {
                                e.target.style.height = 'auto';
                                setUserMessage("응답 중..."); // "응답 중..." 표시
                                handleSendMessage();
                            }
                        }
                    }}
                    style={{ resize: 'none' }} // 크기 조정 비활성화 및 스크롤 숨기기
                    onInput={(e) => {
                        // 이전 높이를 초기화하고 콘텐츠에 맞게 조정
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.max(10, e.target.scrollHeight)}px`; // 최소 높이 10px로 설정
                    }}
                />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </section>
    ), [messages, userMessage]); // 의존성 배열에 필요한 상태 추가

    return memoizedChat; // memoizedChat을 반환
};

export default Chat;