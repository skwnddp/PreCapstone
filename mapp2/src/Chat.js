import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
//npm run build 해야됨

const Chat = () => {
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    // 새 메시지가 추가될 때마다 스크롤을 아래로
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
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
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: userMessage }],
            }, {
                headers: {
                    'Authorization': `Bearer ${GPTKey}`,
                    'Content-Type': 'application/json',
                },
            });

            const gptMessage = {
                sender: 'gpt',
                text: response.data.choices[0]?.message?.content?.trim() || '응답을 받지 못했습니다.',
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
            setUserMessage('');
        }
    };

    return (
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
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="요구사항을 더 입력해보세요!"
                    className="chat-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    style={{ resize: 'none' }} // 크기 조정 비활성화 및 스크롤 숨기기
                    onInput={(e) => {
                        // 이전 높이를 초기화하고 콘텐츠에 맞게 조정
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.max(24, e.target.scrollHeight)}px`; // 최소 높이 24px로 설정
                    }}
                />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </section>
    );
};

export default Chat;