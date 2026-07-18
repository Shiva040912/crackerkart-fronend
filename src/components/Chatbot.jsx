import { useEffect, useRef, useState } from "react";
import { FiSend, FiTrash2, FiX } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { sendChatMessage } from "../api/chatbot";

import "../styles/chatbot.css";

const defaultMessages = [
  {
    id: 1,
    sender: "bot",
    text: "Hello! I am the Japan Pattasu assistant. How can I help you today?",
  },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem("japanPattasuChatHistory");

      if (!savedMessages) {
        return defaultMessages;
      }

      const parsedMessages = JSON.parse(savedMessages);

      return Array.isArray(parsedMessages) && parsedMessages.length > 0
        ? parsedMessages
        : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });

  const popupRef = useRef(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("japanPattasuChatHistory", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async () => {
    const cleanedMessage = message.trim();

    if (!cleanedMessage || isTyping) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: cleanedMessage,
    };

    setMessages((current) => [...current, userMessage]);

    setMessage("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(cleanedMessage);

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: response.reply,
      };

      setMessages((current) => [...current, botMessage]);
    } catch (error) {
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Sorry! Something went wrong. Please try again.",
      };

      setMessages((current) => [...current, botMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    const shouldClear = window.confirm("Clear the complete chat history?");

    if (!shouldClear) {
      return;
    }

    setMessages(defaultMessages);
    setMessage("");
    setIsTyping(false);

    localStorage.removeItem("japanPattasuChatHistory");
  };

  const handleOverlayClick = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-floating-btn"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? <FiX /> : <RiRobot2Line />}

        {!isOpen && <span className="chatbot-online-dot" />}
      </button>

      {isOpen && (
        <div className="chatbot-overlay" onMouseDown={handleOverlayClick}>
          <section ref={popupRef} className="chatbot-popup">
            <header className="chatbot-header">
              <div className="chatbot-header-left">
                <div className="chatbot-avatar">
                  <RiRobot2Line />
                </div>

                <div>
                  <h2>Japan Pattasu AI</h2>

                  <p>Customer support assistant</p>
                </div>
              </div>

              <div className="chatbot-header-actions">
                <button
                  type="button"
                  className="chatbot-clear-btn"
                  onClick={handleClearHistory}
                  aria-label="Clear chat history"
                >
                  <FiTrash2 />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  className="chatbot-close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chatbot"
                >
                  <FiX />
                </button>
              </div>
            </header>

            <div className="chatbot-messages">
              {messages.map((chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={`chatbot-message-row ${
                    chatMessage.sender === "user"
                      ? "chatbot-user-row"
                      : "chatbot-bot-row"
                  }`}
                >
                  {chatMessage.sender === "bot" && (
                    <div className="chatbot-message-avatar">
                      <RiRobot2Line />
                    </div>
                  )}

                  <div
                    className={`chatbot-message ${
                      chatMessage.sender === "user"
                        ? "chatbot-user-message"
                        : "chatbot-bot-message"
                    }`}
                  >
                    {chatMessage.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chatbot-message-row chatbot-bot-row">
                  <div className="chatbot-message-avatar">
                    <RiRobot2Line />
                  </div>

                  <div className="chatbot-message chatbot-bot-message chatbot-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            <footer className="chatbot-input-area">
              <textarea
                ref={inputRef}
                rows="1"
                placeholder="Ask about products, orders or delivery..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                maxLength="500"
              />

              <button
                type="button"
                className="chatbot-send-btn"
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                aria-label="Send message"
              >
                <FiSend />
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
};

export default Chatbot;
