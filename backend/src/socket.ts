import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { parse } from "cookie";
import {
  Game,
  addPlayerToGame,
  removePlayerFromGame,
  getGameState,
  startGame,
  handlePlayerMessage,
  GameEventHandler,
  PublicGameInfo,
} from "./game.js";
import { getUserByToken } from "./user.js";

interface ServerToClientEvents {
  updateGameState: (gameState: PublicGameInfo) => void;
  joinGameError: () => void;
  sendMessage: (message: { text: string; color: string }) => void;
  currentUser: (data: { playerId: string }) => void;
  timerTick: (message: number) => void;
  drawWordInfo: (word: string) => void;
  guessWordInfo: (wordLength: number) => void;
  playerRoundResult: (data: { [playerId: string]: number }) => void;
  endGame: () => void;
}

interface ClientToServerEvents {
  joinRoom: (gameId: string) => void;
  sendMessage: (message: { text: string; color: string }) => void;
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
        io.to(gameId).emit("sendMessage", {
          text: `${playerId} joined the room!`,
          color: "green",
        });
        if (gameState.hostPlayerId === playerId) {
          io.to(gameId).emit("sendMessage", {
            text: `${playerId} is the room owner!`,
            color: "orange",
          });
        }
        io.to(gameId).emit("updateGameState", gameState);
      } catch (e: any) {
        console.log(e.message);
        io.to(socket.id).emit("joinGameError");
      }
    });

    socket.on("startGame", () => {
      try {
        const gameId = socket.data.gameId;
        const eventHandler: GameEventHandler = {
          tickTime: (time: number) => {
            io.to(gameId).emit("timerTick", time);
          },
          sendMessage: (text, color) => {
            io.to(gameId).emit("sendMessage", { text: text, color: color });
          },
          updateGameState: (gameState: Game) => {
            io.to(gameId).emit("updateGameState", gameState);
          },
          sendDrawWordInfo: (word: string, artistId: string) => {
            io.to(`${gameId}/${artistId}`).emit("drawWordInfo", word);
          },
          sendGuessWordInfo: (wordLength: number, guesserIds: string[]) => {
            guesserIds.forEach((guesserId: string) => {
              io.to(`${gameId}/${guesserId}`).emit("guessWordInfo", wordLength);
            });
          },
          sendPlayerRoundResult: (data: { [playerId: string]: number }) => {
            io.to(gameId).emit("playerRoundResult", data);
          },
          endGame: () => {
            io.to(gameId).emit("endGame");
          },
        };
        startGame(gameId, eventHandler);
      } catch (error: any) {
        console.error("Error running game:", error.message);
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
          io.to(gameId).emit("sendMessage", {
            text: `${playerId} left the room!`,
            color: "red",
          });
          if (priorHostPlayerId !== gameState.hostPlayerId) {
            io.to(gameId).emit("sendMessage", {
              text: `${gameState.hostPlayerId} is now the room owner!`,
              color: "orange",
            });
          }
          io.to(gameId).emit("updateGameState", gameState);
        } catch (error: any) {
          console.error("Error removing player:", error.message);
        }
      }
    });

    socket.on("sendMessage", (message) => {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      if (gameId !== null && playerId !== null) {
        const messageToSend = handlePlayerMessage(gameId, playerId, message);
        if (messageToSend !== undefined) {
          io.to(gameId).emit("sendMessage", {
            text: `${playerId}: ${messageToSend.text}`,
            color: messageToSend.color,
          });
        }
      } else {
        console.log("error sending message due to missing info");
      }
    });
  });
}

export { initSocket };
