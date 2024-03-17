import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef, useLayoutEffect } from "react";
import "./chat.css";
import { Socket } from "socket.io-client";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function Chat({ socket }: {socket: Socket}) {
  const [messages, setMessages] = useState<{ text: string, color: string }[]>([]);
  const [textBoxVal, setTextBoxVal] = useState<string>("");
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    socket.on("sendMessage", (message: { text: string, color: string }) => {
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
      socket.emit("sendMessage", { text: textBoxVal, color: "black" });
    }
  };

  return (
    <Box>
      <Box ref={chatBoxRef} sx={{ p: 2, marginBottom: 2, border: '1px solid #ccc', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
          {messages.map((message, index) => (
              <Typography key={index} variant="body1" sx={{ color: message.color || "black" }}>{message.text}</Typography>
          ))}
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
          <TextField
              type="text"
              value={textBoxVal}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your guess here..."
              fullWidth
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{textBoxVal.length}</Typography>
          <Button variant="outlined" onClick={handleSubmit}>Send</Button>
      </Box>
    </Box>
  );
}
