import React, { useState } from 'react';

const chatbotApiUrl = 'https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-DASH-001'; // Ncloud API URL을 입력

function Cloverbot() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: 'You', text: userInput }];
    setMessages(newMessages);

    // API 요청
    try {
      const response = await fetch(chatbotApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-NCP-APIGW-API-KEY-ID': '공백',  // API 키 ID
          'X-NCP-APIGW-API-KEY': '공백',        // API 키
        },
        body: JSON.stringify({
          version: 'v2',
          userId: 'your-user-id',
          timestamp: Date.now(),
          bubbles: [
            {
              type: 'text',
              data: { description: userInput }
            }
          ],
          event: 'send'
        })
      });
      
      const data = await response.json();
      setMessages([...newMessages, { sender: 'Bot', text: data.bubbles[0].data.description }]);
    } catch (error) {
      console.error('Error:', error);
    }

    setUserInput(''); // 입력 필드 비우기
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={message.sender === 'You' ? 'user-message' : 'bot-message'}>
            <strong>{message.sender}: </strong>{message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Cloverbot;
