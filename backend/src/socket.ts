import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export function initSocket(server: HttpServer) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
