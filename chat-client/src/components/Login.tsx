import { FC, useState } from "react";
import { ChatUser, LoginResult } from "../../../types";
import { useMutation } from "react-query";
import { useSocket } from "../socketIo/useSocketIo";

interface LoginProps {
  setUser: (user: ChatUser) => void;
}



const Login: FC<LoginProps> = ({ setUser }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const { connectSocket } = useSocket()
  const { mutateAsync: login, isLoading } = useMutation<
    LoginResult,
    Error,
    string
  >({
    mutationFn: async (username: string) => {
      return fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }).then((res) => res.json());
    },
    onError: (error) => {
      alert("Login failed");
      console.error(error);
    },
  });
  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <button
        style={{ marginLeft: 8 }}
        disabled={isLoading}
        onClick={async () => {
          const loginResult = await login(usernameInput);
          if (loginResult.message == 'invalid') {
            return alert('user not found')
          }

          const socketResult = await connectSocket('http://localhost:3000', {
            auth: {
              username: loginResult.user.username,
            },
          });
          if (socketResult === 'ERROR') {
            return alert('socket connection failed')
          }
          if (socketResult === 'SOCKET_TIMEOUT') {
            return alert('socket connection timeout')
          }
          setUser(loginResult.user);
        }
        }
      >
        Login
      </button>
    </div>
  );
};

export default Login;
