import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { parse } from "cookie";
import {
  Game,
  addPlayerToGame,
  removePlayerFromGame,
  getGameState,
  storeCanvasState,
  clearCanvasState,
  startGame,
  handlePlayerMessage,
  GameEventHandler,
  PublicGameInfo,
} from "./game.js";
import { getUserByToken } from "./user.js";

type Point = { x: number; y: number };

interface ServerToClientEvents {
  updateGameState: (gameState: PublicGameInfo) => void;
  playerJoined: () => void;
  playerLeft: () => void;
  joinGameError: () => void;
  drawLine: (
    prevPoint: Point,
    currentPoint: Point,
    color: string,
    width: number
  ) => void;
  canvasStateFromServer: (state: string) => void;
  clear: () => void;
  sendMessage: (message: { text: string; color: string }) => void;
  currentUser: (data: { playerId: string }) => void;
  timerTick: (message: number) => void;
  startPlayerRound: () => void;
  drawWordInfo: (word: string) => void;
  guessWordInfo: (wordLength: number) => void;
  playerRoundResult: (data: { [playerId: string]: number }) => void;
  playerGuessedCorrect: () => void;
  endGame: () => void;
}

interface ClientToServerEvents {
  joinRoom: (gameId: string) => void;
  drawLine: (
    prevPoint: Point,
    currentPoint: Point,
    color: string,
    width: number
  ) => void;
  canvasState: (state: string) => void;
  clear: () => void;
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
  >(server, {
    cookie: true,
  });

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
        io.to(gameId).emit("playerJoined");
        if (gameState.hostPlayerId === playerId) {
          io.to(gameId).emit("sendMessage", {
            text: `${playerId} is the room owner!`,
            color: "orange",
          });
        }
        io.to(gameId).emit("updateGameState", gameState);
        io.to(socket.id).emit("canvasStateFromServer", gameState.canvasState);
      } catch (e: any) {
        console.log(e);
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
          startPlayerRound: () => {
            io.to(gameId).emit("clear");
            io.to(gameId).emit("startPlayerRound");
          },
          sendPlayerGuessedCorrect: () => {
            io.to(gameId).emit("playerGuessedCorrect");
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
          io.to(gameId).emit("playerLeft");
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

    socket.on("drawLine", (prevPoint, currentPoint, color, width) => {
      const gameId = socket.data.gameId;
      if (gameId !== null) {
        socket
          .to(gameId)
          .emit("drawLine", prevPoint, currentPoint, color, width);
      }
    });

    socket.on("canvasState", (state) => {
      const gameId = socket.data.gameId;
      storeCanvasState(gameId, state);
    });

    socket.on("clear", () => {
      const gameId = socket.data.gameId;
      if (gameId !== null) {
        clearCanvasState(gameId);
        io.to(gameId).emit("clear");
      }
    });
  });
}

export { initSocket };
