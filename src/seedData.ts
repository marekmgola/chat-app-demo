import { redisClient } from ".";
import { ChatRoom, ChatUser, ChatMessage } from "../types";

export const seedData = () => {
  console.log("Seeding data");
  redisClient.set(
    "chatrooms",
    JSON.stringify([{ id: 1, name: "Chatroom 1" }] satisfies ChatRoom[])
  );
  redisClient.set(
    "user:Marek",
    JSON.stringify({ id: 1, username: "Marek" } satisfies ChatUser)
  );
  redisClient.set(
    "user:Bob",
    JSON.stringify({ id: 1, username: "Bob" } satisfies ChatUser)
  );
  redisClient.LTRIM("message:1", 0, -100);
  redisClient.rPush(
    "message:1",
    JSON.stringify({
      id: Math.floor(Math.random() * 1000000),
      author: "Marek",
      message: "Hello from first message",
    } satisfies ChatMessage)
  );
};
