import express, { json } from "express";
import cors from "cors";
import { createClient } from "redis";
import { z } from "zod";
import { LoginResult, ChatMessage, ChatRoom } from "../types";
import { seedData } from "./seedData";
import http from "http";
import { Server } from "socket.io";

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

export const redisClient = createClient({
  url: "redis://redis:6379",
});

redisClient.connect();

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

const app = express();
const port = 3000;

app.use(cors({ origin: allowedOrigins }));
app.use(json());
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  const username =
    socket.handshake.headers.username || socket.handshake.auth.username;
  console.log(`User: ${username} connected on ${process.env.serverName}`);
  const rooms = await redisClient.get("chatrooms");
  if (rooms) {
    JSON.parse(rooms).forEach((room: ChatRoom) => {
      socket.join(room.id.toString());
    });
  }

  socket.on("disconnect", () => {
    console.log(
      `User: ${username} disconnected from ${process.env.serverName}`
    );
  });
});

app.post("/login", async (req, res) => {
  const username = req.body?.username;
  if (!username) {
    res.status(400).send("username is required");
    return;
  }

  const user = await redisClient.get(`user:${username}`);
  if (!user) {
    const result: LoginResult = { message: "invalid" };
    res.status(401).json(result);
    return;
  }

  const result: LoginResult = {
    message: "ok",
    user: JSON.parse(user),
  };
  res.json(result);
});

app.get("/chatrooms/", async (_req, res) => {
  const chatrooms = await redisClient.get("chatrooms");
  if (!chatrooms) {
    res.status(404).send("chatrooms not found");
    return;
  }
  res.json(JSON.parse(chatrooms));
});

app.get("/chatrooms/:chatroomId/messages", async (req, res) => {
  const paramSchema = z.object({
    limit: z.string().min(1),
  });

  const { limit } = paramSchema.parse(req.query);

  const messages = await redisClient.lRange(
    `message:${req.params.chatroomId}`,
    0,
    parseInt(limit)
  );
  if (!messages) {
    res.status(404).send("messages not found");
    return;
  }
  res.json(messages.map((message) => JSON.parse(message)));
});

app.post("/chatrooms/:chatroomId/messages", async (req, res) => {
  const paramSchema = z.object({
    message: z.string().min(1),
    user: z.string().min(1),
  });
  const chatroomId = req.params.chatroomId;

  const { message, user } = paramSchema.parse(req.body);

  const newMessage: ChatMessage = {
    id: Math.floor(Math.random() * 1000000),
    author: user,
    message,
  };
  io.to(chatroomId).emit("newMessage", newMessage);
  redisClient.RPUSH(`message:${chatroomId}`, JSON.stringify(newMessage));
  res.status(201).json(newMessage);
});

server.listen(port, () => {
  seedData();
  return console.log(
    `Express is listening at http://${
      process.env.serverName ?? "localhost"
    }:${port}`
  );
});
