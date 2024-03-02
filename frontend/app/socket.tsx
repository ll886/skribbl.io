import { io } from "socket.io-client";
import { serverUrl } from './config';

// ref: https://socket.io/docs/v3/client-initialization/#transports
const socket = io(serverUrl, {
  autoConnect: false,
  extraHeaders: {},
  transports: ["websocket", "polling"],
});

socket.on("connect_error", () => {
  // revert to classic upgrade
  socket.io.opts.transports = ["polling", "websocket"];
});

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
