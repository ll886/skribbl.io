import express from "express";
import { createServer } from 'node:http';
import { initSocket } from './socket.js';
import gamesRouter from './routes.games.js';

// init app
const port = 3001
const host = "localhost";
const protocol = "http";
const app = express();
const server = createServer(app);
initSocket(server);
app.use(express.json());

// app routes
app.use("/api/games", gamesRouter);

server.listen(port, () => {
  console.log(`${protocol}://${host}:${port}`);
});
