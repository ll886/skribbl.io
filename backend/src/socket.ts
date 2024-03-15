import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { parse } from "cookie";
import {
  Player,
  Game,
  addPlayerToGame,
  removePlayerFromGame,
  getGameState,
  startGame,
  recordPlayerMessage,
} from "./game.js";
import { getUserByToken } from "./user.js";

interface ServerToClientEvents {
  updateGameState: (gameState: Game) => void;
  joinGameError: () => void;
  sendMessage: (message: string) => void;
  currentUser: (data: { playerId: string }) => void;
  timerTick: (message: number) => void;
  drawWordInfo: (word: string) => void;
  guessWordInfo: (wordLength: number) => void;
}

interface ClientToServerEvents {
  joinRoom: (gameId: string) => void;
  sendMessage: (message: string) => void;
  startGame: () => void;
}

interface InterServerEvents {}

interface SocketData {
  gameId: string;
  playerId: string;
}

function initSocket(server: HttpServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { cookie: true });

  io.on("connection", async (socket) => {
    console.log("a user connected");
    if (socket.request.headers.cookie !== undefined) {
      const cookies = parse(socket.request.headers.cookie);
      if (cookies.hasOwnProperty("guestId")) {
        socket.data.playerId = cookies.guestId;
      }
      if (cookies.hasOwnProperty("token")) {
        const user = await getUserByToken(cookies.token);
        if (user !== undefined) {
          socket.data.playerId = user.username;
        }
      }
    }

    socket.on("joinRoom", (gameId) => {
      try {
        const playerId = socket.data.playerId;
        addPlayerToGame(gameId, playerId);
        socket.data.gameId = gameId;
        socket.join(gameId);
        socket.join(`${gameId}/${playerId}`);
        const gameState = getGameState(gameId);
        io.to(socket.id).emit("currentUser", { playerId: playerId });
        io.to(gameId).emit("sendMessage", `${playerId} joined the room!`);
        if (gameState.hostPlayerId === playerId) {
          io.to(gameId).emit("sendMessage", `${playerId} is the room owner!`);
        }
        io.to(gameId).emit("updateGameState", gameState);
      } catch (e) {
        console.log(e);
        io.to(socket.id).emit("joinGameError");
      }
    });

    socket.on("startGame", () => {
      try {
        const gameId = socket.data.gameId;
        startGame(
          gameId,
          (time: number) => {
            io.to(gameId).emit("timerTick", time);
          },
          (message: string) => {
            io.to(gameId).emit("sendMessage", message);
          },
          (gameState: Game) => {
            io.to(gameId).emit("updateGameState", gameState);
          },
          (word: string, artistId: string) => {
            io.to(`${gameId}/${artistId}`).emit("drawWordInfo", word);
          },
          (wordLength: number, guesserIds: string[]) => {
            guesserIds.forEach((guesserId: string) => {
              io.to(`${gameId}/${guesserId}`).emit("guessWordInfo", wordLength);
            });
          }
        );
      } catch (error) {
        console.error("Error starting game:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      if (gameId !== null && playerId !== null) {
        console.log("attempt to remove player");
        socket.leave(gameId);
        socket.leave(`${gameId}/${playerId}`);
        try {
          const priorHostPlayerId = getGameState(gameId).hostPlayerId;
          removePlayerFromGame(gameId, playerId);
          const gameState = getGameState(gameId);
          io.to(gameId).emit("sendMessage", `${playerId} left the room!`);
          if (priorHostPlayerId !== gameState.hostPlayerId) {
            io.to(gameId).emit(
              "sendMessage",
              `${gameState.hostPlayerId} is now the room owner!`
            );
          }
          io.to(gameId).emit("updateGameState", gameState);
        } catch (e) {
          console.log(e);
        }
      }
    });

    socket.on("sendMessage", (message) => {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      if (gameId !== null && playerId !== null) {
        io.to(gameId).emit("sendMessage", `${playerId}: ${message}`);
        recordPlayerMessage(gameId, playerId, message);
      } else {
        console.log("error sending message due to missing info");
      }
    });
  });
}

export { initSocket };
