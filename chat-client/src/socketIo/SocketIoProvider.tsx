import React, { FC, useCallback, useEffect, useRef } from "react";
import { ManagerOptions, Socket, SocketOptions, io } from "socket.io-client";

type SocketConnectionResult = "SUCCESS" | "ERROR" | "SOCKET_TIMEOUT";

export const SocketIoContext = React.createContext<{
    socket: React.MutableRefObject<Socket | null>;
    connectSocket: (
        url: string,
        opts?: Partial<ManagerOptions & SocketOptions> | undefined,
        callbacks?: {
            onConnected?: () => void;
            onDisconnected?: () => void;
            onError?: (error: Error) => void;
        }
    ) => Promise<SocketConnectionResult>;
}>({
    socket: { current: null },
    connectSocket: () => Promise.resolve("ERROR"),
});

interface SocketIoProviderProps {
    children: React.ReactNode;
}
const SocketIoProvider: FC<SocketIoProviderProps> = ({ children }) => {
    const socket = useRef<Socket | null>(null);

    useEffect(() => {
        const cleanup = () => {
            socket.current?.disconnect();
        };
        return cleanup;
    }, []);

    const connectSocket = useCallback(
        (
            url: string,
            options?: Partial<ManagerOptions & SocketOptions> | undefined,
            callbacks?: {
                onConnected?: () => void;
                onDisconnected?: () => void;
                onError?: (error: Error) => void;
            }
        ) => {
            return new Promise<SocketConnectionResult>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("SOCKET_TIMEOUT"));
                }, 30000);
                socket.current = io(url, {
                    transports: ["websocket"],
                    ...options,
                });
                socket.current.connect();
                socket.current.on("connect", () => {
                    callbacks?.onConnected?.();
                    clearTimeout(timeout);
                    resolve("SUCCESS");
                });
                socket.current.on("disconnect", () => {
                    callbacks?.onDisconnected?.();
                });
                socket.current.on("error", (error) => {
                    console.error("Socket error", error);
                    clearTimeout(timeout);
                    reject(new Error("ERROR"));
                });
                // socket.current.onAnyOutgoing((data) => console.log('outgoing', data));
            });
        },
        []
    );

    return (
        <SocketIoContext.Provider
            value={{
                socket,
                connectSocket,
            }}
        >
            {children}
        </SocketIoContext.Provider>
    );
};

export default SocketIoProvider;