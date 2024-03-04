import express from "express";
import cors from "cors";
import { createServer } from 'node:http';
import { initSocket } from './socket.js';
import roomsRouter from './routes.rooms.js';

// init app
const port = 3001
const host = "localhost";
const protocol = "http";
const app = express();
const server = createServer(app);
initSocket(server);
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
  ],
}))

// app routes
app.use("/api/rooms", roomsRouter);

server.listen(port, () => {
  console.log(`${protocol}://${host}:${port}`);
});
