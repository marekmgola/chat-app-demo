import { useState } from "react";
import ChatList from ".././components/ChatList";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChatUser } from "../../../types";
import Login from ".././components/Login";
import SocketIoProvider from "../socketIo/SocketIoProvider";

function Main() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  const [user, setUser] = useState<ChatUser | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketIoProvider>
        {user ? <ChatList user={user} /> : <Login setUser={setUser} />}
      </SocketIoProvider>
    </QueryClientProvider>
  );
}

export default Main;
