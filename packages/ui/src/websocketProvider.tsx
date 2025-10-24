"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type WSContextType = {
  socket: WebSocket | null;
  send: (event: string, payload: any) => void;
};

const WSContext = createContext<WSContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const token = session.user.id;
    const ws = new WebSocket(`ws://localhost:8080/?token=${token}`);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      socketRef.current = ws;
      setSocket(ws);
      console.log("Socket");
      console.log(socketRef.current);

    };

    ws.onclose = () => {
      console.log("Disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.close();
      socketRef.current = null;
      setSocket(null);
    };
  }, [session]);

  const send = (action: string, payload: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }
    socketRef.current.send(JSON.stringify({ action, payload }));
  };

  return (
    <WSContext.Provider value={{ socket, send }}>
      {children}
    </WSContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error("useSocket must be used inside WebSocketProvider");
  return ctx;
};