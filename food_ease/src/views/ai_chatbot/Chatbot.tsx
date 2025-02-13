import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import BackIcon from "../../assets/back-icon-arrow.svg";
import SendIcon from "../../assets/send-icon.svg";

function formatTime(date: any) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  // Convert 24-hour format to 12-hour format
  const formattedHours = hours % 12 || 12;

  // Format: "4:00 PM"
  return `${formattedHours}:${minutes} ${period}`;
}

function Chatbot() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<{ text: string; time: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  // Fungsi untuk menambahkan pesan otomatis pertama kali
  useEffect(() => {
    const now = new Date();
    const formattedTime = formatTime(now);
    const firstMessage = { text: "Hello! How can I assist you today?", time: formattedTime };

    setMessages([firstMessage]); // Menambahkan pesan pertama otomatis
  }, []);

  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === "" || isSending) return;

    setIsSending(true);

    const now = new Date();
    const formattedTime = formatTime(now);

    const newMessage = { text: currentMessage, time: formattedTime };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setCurrentMessage(""); // Clear input field

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: currentMessage }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          const aiMessage = { text: data.result, time: formatTime(new Date()) };
          setMessages((prevMessages) => [...prevMessages, aiMessage]);
        } else {
          console.error("Expected JSON response but got:", contentType);
        }
      } else {
        console.error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Auto scrool
  useEffect(() => {
    const chatContainer = document.querySelector(".scroll-auto");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full mx-auto h-full bg-[#FFF7D1]">
      {/* Header */}
      <div className="flex p-[10%]">
        <img
          src={BackIcon}
          alt="Back"
          className="mr-[10%] cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        />
        <div className="w-full flex justify-center pr-4">
          <h1 className="text-[#FFB0B0] font-bold text-3xl">Chat with AI</h1>
        </div>
      </div>
      {/* Body */}
      <div className="bg-white h-[73vh] max-h-full rounded-t-[2.5rem] flex flex-col justify-between">
        {/* Chat Messages */}
        <div className="flex flex-col p-[10%] overflow-y-auto h-[100%] scroll-auto">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center">No messages yet...</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"
                  } mb-4`}
              >
                <div
                  className={`relative py-2 px-4 max-w-[70%] rounded-lg ${index % 2 === 0
                      ? "bg-[#FFF7D1] border-2 border-[#FFB0B0] rounded-tl-[15px] rounded-br-[15px]"
                      : "bg-[#FFD09B] border-2 border-[#FFB0B0] rounded-tl-[15px] rounded-br-[15px]"
                    }`}
                >
                  <span className={index % 2 === 0 ? "text-black" : "text-white"}>
                    {message.text}
                  </span>
                  {/* Display time below the message */}
                  <div
                    className={`text-xs mt-1 ${index % 2 === 0 ? "text-gray-400" : "text-white font-light"
                      }`}
                  >
                    {message.time}
                  </div>

                  {/* Arrow for speech bubble */}
                  <div
                    className={`absolute bottom-[-10px] ${index % 2 === 0 ? "left-[10px]" : "right-[10px]"
                      } w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-[#FFB0B0]`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        {/* Input Field */}
      </div>
      <div className="flex items-center p-[10%] bg-[#FFF7D1] rounded-b-[2.5rem]">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 h-[2.5rem] rounded-full px-[1rem] bg-white shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <button
          className="ml-4 bg-[#FFD09B] p-2 rounded-full"
          onClick={handleSendMessage}
        >
          <img src={SendIcon} alt="Send" />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
