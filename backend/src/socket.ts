import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  Player,
  Game,
  addPlayerToGame,
  removePlayerFromGame,
  getGameState,
} from "./game.js";

interface ServerToClientEvents {
  updateGameState: (gameState: Game) => void;
  joinGameError: () => void;
  sendMessage: (message: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (gameId: string, player: Player) => void;
  sendMessage: (message: string) => void;
}

interface InterServerEvents {}

interface SocketData {
  gameId: string;
  player: Player;
}

function initSocket(server: HttpServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("joinRoom", (gameId, player) => {
      try {
        addPlayerToGame(gameId, player);
        socket.data.gameId = gameId;
        socket.data.player = player;
        socket.join(gameId);
        const gameState = getGameState(gameId);
        io.to(gameId).emit("updateGameState", gameState);
      } catch (e) {
        console.log(e);
        io.to(socket.id).emit("joinGameError");
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const gameId = socket.data.gameId;
      const player = socket.data.player;
      console.log(gameId, player);
      if (gameId !== null && player !== null) {
        console.log("attempt to remove player");
        try {
          removePlayerFromGame(gameId, player);
          const gameState = getGameState(gameId);
          io.to(gameId).emit("updateGameState", gameState);
        } catch (e) {
          console.log(e);
        }
      }
    });

    socket.on("sendMessage", (message) => {
      const gameId = socket.data.gameId;
      const player = socket.data.player;
      if (gameId !== null && player !== null) {
        io.to(gameId).emit("sendMessage", `${player.id}: ${message}`);
      } else {
        console.log("error sending message due to missing info");
      }
    });
  });
}

export { initSocket };
