import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import "./chat.css";

export default function Chat({ socket }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [textBoxVal, setTextBoxVal] = useState<string>("");

  useEffect(() => {
    socket.on("sendMessage", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextBoxVal(value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (textBoxVal.trim() !== "") {
      setTextBoxVal("");
      socket.emit("sendMessage", textBoxVal);
    }
  };

  return (
    <div>
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="text-box">
        <input
          type="text"
          value={textBoxVal}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your guess here..."
        />
        <div className="character-count">{textBoxVal.length}</div>
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
}
