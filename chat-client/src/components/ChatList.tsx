import { FunctionComponent, useState } from "react";
import { ChatRoom, ChatUser } from "../../../types";
import Chat from "./ChatRoom";
import { useQuery } from "react-query";

interface ChatListProps {
    user: ChatUser;
}

const ChatList: FunctionComponent<ChatListProps> = ({ user }) => {
    const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);

    const { data: chatList } = useQuery<ChatRoom[]>("chatrooms", () => {
        return fetch("http://localhost:3000/chatrooms").then((res) => res.json());
    });

    return selectedChat ? (
        <Chat user={user} id={selectedChat.id} name={selectedChat.name} />
    ) : (
        <div>
            {chatList?.map((chat) => (
                <div key={chat.id}>
                    <h1>{chat.name}</h1>
                    <button onClick={() => setSelectedChat(chat)}>Join</button>
                </div>
            ))}
        </div>
    );
};
export default ChatList;
