import { FC, useCallback, useEffect, useState } from "react";
import { ChatMessage, ChatUser } from "../../../types";
import { useMutation, useQuery } from "react-query";
import { useSocket } from "../socketIo/useSocketIo";

interface ChatRoomProps {
    id: number;
    name: string;
    user: ChatUser;
}

const limit = 10;
const ChatRoom: FC<ChatRoomProps> = ({ id, name, user }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState<string>("");
    const { socket } = useSocket();
    const addMessageIfDoesntExist = useCallback(
        (message: ChatMessage) => {
            setMessages((messages) =>
                messages.map((message) => message.id).includes(message.id)
                    ? messages
                    : [...messages, message]
            );
        },
        [setMessages]
    );

    useEffect(() => {
        if (!socket) return;
        socket.current?.on("newMessage", addMessageIfDoesntExist);
        const cleanup = () => {
            socket.current?.off("newMessage", addMessageIfDoesntExist);
        };
        return cleanup;
    }, [socket, addMessageIfDoesntExist]);




    const { isLoading } = useQuery<ChatMessage[]>(
        ["chatmessage", id, limit],
        () => {
            return fetch(
                `http://localhost:3000/chatrooms/${id}/messages?limit=${limit}`
            ).then((res) => res.json());
        },
        {
            onSuccess: setMessages,
        }
    );
    const { mutateAsync: sendMessage } = useMutation<ChatMessage, Error, string>(
        (message: string) => {
            return fetch(`http://localhost:3000/chatrooms/${id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message, user: user.username }),
            }).then((res) => res.json());
        },
        {
            onSuccess: (message) => {
                addMessageIfDoesntExist(message);
                setInput("");
            },
            onError: (error) => {
                alert("Failed to send message");
                console.error(error);
            },
        }
    );

    const handleSubmit = useCallback(() => {
        if (!input.length) return;
        sendMessage(input);
    }, [input, sendMessage]);

    return (
        <div key={id}>
            <h1>Room: {name}</h1>
            {isLoading ? (
                <div>Loading...</div>
            ) : !messages.length ? (
                <div>No Messages</div>
            ) : (
                <>
                    {messages.map((message) => (
                        <p key={message.id}>
                            <strong>{message.author}</strong>: {message.message}
                        </p>
                    ))}
                </>
            )}
            <div>
                <input
                    value={input}
                    type="text"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                            handleSubmit();
                        }
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInput(e.target.value)
                    }
                />
                <button onClick={handleSubmit} style={{ marginLeft: 8 }}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;
