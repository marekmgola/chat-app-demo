export type ChatUser = {
  id: number;
  username: string;
};

export type ChatRoom = {
  id: number;
  name: string;
};

export type ChatMessage = {
  id: number;
  author: string;
  message: string;
};

export type LoginResult =
  | {
      message: "ok";
      user: ChatUser;
    }
  | {
      message: "invalid";
    };
