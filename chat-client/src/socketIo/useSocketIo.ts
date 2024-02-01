import React from "react";
import { SocketIoContext } from "./SocketIoProvider";

export const useSocket = () => {
  const context = React.useContext(SocketIoContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketIoProvider");
  }
  return context;
};
