import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // API 키를 여기 직접 넣음
  const OPENAI_API_KEY = "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";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const botMessage = {
        sender: "bot",
        text: response.data.choices[0]?.message?.content || "No response from the bot.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "error",
        text: `Error: ${error.response?.data?.error?.message || error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput("");
  };

  return (
    <div>
      <h1>GPT Chatbot</h1>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "user" ? "user-msg" : msg.sender === "bot" ? "bot-msg" : "error-msg"}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;