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
  player: Player;
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
        const player = { id: cookies.guestId, points: 0 };
        // TODO refactor to just store the playerId
        socket.data.player = player;
      }
      if (cookies.hasOwnProperty("token")) {
        const user = await getUserByToken(cookies.token);
        if (user !== undefined) {
          const player = { id: user.username, points: 0 };
          socket.data.player = player;
        }
      }
    }

    socket.on("joinRoom", (gameId) => {
      try {
        const player = socket.data.player;
        addPlayerToGame(gameId, player);
        socket.data.gameId = gameId;
        socket.join(gameId);
        socket.join(`${gameId}/${player.id}`);
        const gameState = getGameState(gameId);
        io.to(socket.id).emit("currentUser", { playerId: player.id });
        io.to(gameId).emit("sendMessage", `${player.id} joined the room!`);
        if (gameState.hostPlayerId === player.id) {
          io.to(gameId).emit("sendMessage", `${player.id} is the room owner!`);
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
          },
        );
      } catch (error) {
        console.error("Error starting game:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      const gameId = socket.data.gameId;
      const player = socket.data.player;
      if (gameId !== null && player !== null) {
        console.log("attempt to remove player");
        socket.leave(gameId);
        socket.leave(`${gameId}/${player.id}`);
        try {
          const priorHostPlayerId = getGameState(gameId).hostPlayerId;
          removePlayerFromGame(gameId, player);
          const gameState = getGameState(gameId);
          io.to(gameId).emit("sendMessage", `${player.id} left the room!`);
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
      const player = socket.data.player;
      if (gameId !== null && player !== null) {
        io.to(gameId).emit("sendMessage", `${player.id}: ${message}`);
        recordPlayerMessage(gameId, player.id, message);
      } else {
        console.log("error sending message due to missing info");
      }
    });
  });
}

export { initSocket };
