import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { parse } from "cookie";
import {
  Player,
  Game,
  addPlayerToGame,
  removePlayerFromGame,
  getGameState,
  storeCanvasState,
} from "./game.js";
import { getUserByToken } from "./user.js";

type Point = { x: number; y: number }

interface ServerToClientEvents {
  updateGameState: (gameState: Game) => void;
  joinGameError: () => void;
  sendMessage: (message: string) => void;
  drawLine: (prevPoint: Point, currentPoint: Point, color: string, width: number) => void;
  canvasStateFromServer: (state: string) => void;
  clear: (clearFunc: () => void) => void;
}

interface ClientToServerEvents {
  joinRoom: (gameId: string) => void;
  sendMessage: (message: string) => void;
  drawLine: (prevPoint: Point, currentPoint: Point, color: string, width: number) => void;
  canvasState: (state: string) => void;
  clear: (clearFunc: () => void) => void;
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
  >(server, {
    cookie: true,
    cors: {
    origin: '*'
  }, });

  io.on("connection", async (socket) => {
    console.log("a user connected");
    if (socket.request.headers.cookie !== undefined) {
      const cookies = parse(socket.request.headers.cookie);
      if (cookies.hasOwnProperty("guestId")) {
        const player = { id: cookies.guestId };
        socket.data.player = player;
      }
      if (cookies.hasOwnProperty("token")) {
        const user = await getUserByToken(cookies.token);
        if (user !== undefined) {
          const player = { id: user.username };
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
        const gameState = getGameState(gameId);
        io.to(gameId).emit("sendMessage", `${player.id} has joined the game`);
        io.to(gameId).emit("updateGameState", gameState);
        io.to(socket.id).emit("canvasStateFromServer", gameState.canvasState);
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
          io.to(gameId).emit("sendMessage", `${player.id} has left the game`);
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

    socket.on("drawLine", (prevPoint, currentPoint, color, width) => {
      const gameId = socket.data.gameId;
      if (gameId !== null) {
        socket.to(gameId).emit("drawLine",  prevPoint, currentPoint, color, width);
      }
    });

    socket.on('canvasState', (state) => {
      const gameId = socket.data.gameId;
      console.log('received canvas state')
      storeCanvasState(gameId, state);
    })

    socket.on('clear', (clearFunc: () => void) => {
      const gameId = socket.data.gameId;
      if (gameId !== null) {
        socket.to(gameId).emit("clear",  clearFunc);
      }
    })
  });
}


export { initSocket };
