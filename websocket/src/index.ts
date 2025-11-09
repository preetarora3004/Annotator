import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import { createServer, IncomingMessage } from "http";
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
const PORT = Number(process.env.PORT) || 8080;
const server = createServer(app);

const wss = new WebSocketServer({ noServer: true });
const users = new Map<string, WebSocket>();

type Message = {
  action: "object:added" | "object:modified" | "object:deleted" | "path:added" | "object:move" | "object:start" | "preview:start" | "preview:move" | "preview:end";
  payload: {
    type: "rect" | "circle" | "path";
    left: number;
    top: number;
    stroke: string;
    strokeWidth: number;
    fill: string;
    selectable: boolean;
    hasControls: boolean;
    rx?: number;
    ry?: number;
    height?: number;
    width?: number;
    radius?: number;
    path?: any[];
    id?: string;
  };
};

const broadcast = async (data: Message, senderId: string) => {
  users.forEach((client, id) => {
    if (id !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

server.on("upgrade", (req, socket, head) => {
  try {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    socket.destroy();
  }
});

wss.on("connection", async (socket: WebSocket, req: IncomingMessage) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const tokenFromQuery = url.searchParams.get("token");

  if (!tokenFromQuery) {
    socket.close();
    return;
  }

  users.set(tokenFromQuery, socket);

  socket.on("message", async (data: WebSocket.RawData, isBinary) => {

    if(isBinary) return;

    try {
      const message: Message = JSON.parse(data.toString());
      broadcast(message, tokenFromQuery);
    } catch (err) {
      console.error("Invalid message:", err);
    }
  });

  socket.on("close", () => {
    users.delete(tokenFromQuery);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});