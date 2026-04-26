import React, { useEffect, useRef, useState } from "react";
import "./ChatbotWidget.css";
import { FAQS } from "./FaqData";

type Sender = "bot" | "user";

type Message = {
  sender: Sender;
  text: string;
  time: string;
};

function getCurrentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DEFAULT_MESSAGES: Message[] = [
  {
    sender: "bot",
    text: "Hello 👋 Welcome to Project VAASTU Assistant. Ask me about approvals, satellite monitoring, revenue, roadmap, risks, or workflow.",
    time: getCurrentTime(),
  },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?.!,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function simpleFuzzy(text: string): string {
  return text
    .replace(/vaasthu/g, "vaastu")
    .replace(/vastu/g, "vaastu")
    .replace(/vaa stu/g, "vaastu")
    .replace(/satelite/g, "satellite")
    .replace(/scrunity/g, "scrutiny")
    .replace(/approvel/g, "approval")
    .replace(/monitering/g, "monitoring")
    .replace(/revenew/g, "revenue")
    .replace(/permisson/g, "permission")
    .replace(/grampanchayat/g, "gram panchayat")
    .replace(/panchayath/g, "panchayat")
    .replace(/geo fence/g, "geofence")
    .replace(/auto dcr/g, "autodcr")
    .replace(/auto-dcr/g, "autodcr")
    .replace(/enti/g, "what")
    .replace(/ante/g, "means")
    .replace(/ela/g, "how")
    .replace(/enduku/g, "why")
    .replace(/emiti/g, "what")
    .replace(/cheppu/g, "tell")
    .replace(/gurinchi/g, "about")
    .replace(/\s+/g, " ")
    .trim();
}

function scorePattern(input: string, pattern: string): number {
  if (input.includes(pattern)) return pattern.length + 20;

  const inputWords = input.split(" ");
  const patternWords = pattern.split(" ");
  let score = 0;

  for (const word of patternWords) {
    if (inputWords.some((w) => w.includes(word) || word.includes(w))) {
      score += 3;
    }
  }

  return score;
}

function getBestAnswer(rawInput: string): string {
  const normalized = simpleFuzzy(normalizeText(rawInput));

  let bestAnswer = "";
  let bestScore = 0;

  for (const faq of FAQS) {
    for (const rawPattern of faq.patterns) {
      const pattern = simpleFuzzy(normalizeText(rawPattern));
      const score = scorePattern(normalized, pattern);

      if (score > bestScore) {
        bestScore = score;
        bestAnswer = faq.answer;
      }
    }
  }

  if (bestScore >= 6) return bestAnswer;

  return "I can help with Project VAASTU topics like Smart Scrutiny, Satellite Sentinel, Revenue Radar, approvals, satellite monitoring, roadmap, ROI, workflow, and risks. Try asking: What is VAASTU? How does Smart Scrutiny work? What is Green Channel approval?";
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("chatbotOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatbotMessages");
    return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
  });

  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const replyToQuestion = (question: string) => {
    if (!question.trim() || isTyping) return;

    const userMessage: Message = {
      sender: "user",
      text: question,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        sender: "bot",
        text: getBestAnswer(question),
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 900);
  };

  const sendMessage = () => {
    replyToQuestion(input);
  };

  const handleQuickQuestion = (question: string) => {
    replyToQuestion(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages(DEFAULT_MESSAGES);
    setIsTyping(false);
    localStorage.setItem("chatbotMessages", JSON.stringify(DEFAULT_MESSAGES));
  };

  useEffect(() => {
    localStorage.setItem("chatbotOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem("chatbotMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  return (
    <div className="chatbot-widget">
      {isOpen ? (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">V</div>
              <div>
                <h3>VAASTU Assistant</h3>
                <p>Online now</p>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                className="chatbot-icon-btn"
                onClick={clearChat}
                aria-label="Clear chat"
                title="Clear chat"
              >
                ⟳
              </button>
              <button
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chatbot"
                title="Minimize"
              >
                ×
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-row ${msg.sender === "user" ? "user" : "bot"}`}
              >
                <div className={`chatbot-message ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span>{msg.time}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-row bot">
                <div className="chatbot-message bot typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-actions">
            <button onClick={() => handleQuickQuestion("What is VAASTU?")}>
              What is VAASTU?
            </button>
            <button onClick={() => handleQuickQuestion("How does Smart Scrutiny work?")}>
              Smart Scrutiny
            </button>
            <button onClick={() => handleQuickQuestion("How does satellite monitoring work?")}>
              Satellite Monitoring
            </button>
            <button onClick={() => handleQuickQuestion("What is the implementation roadmap?")}>
              Roadmap
            </button>
            <button onClick={() => handleQuickQuestion("VAASTU ante enti?")}>
              తెలుగు FAQ
            </button>
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Ask about Project VAASTU..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage} className="send-btn">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
          title="Open chatbot"
        >
          💬
        </button>
      )}
    </div>
  );
}