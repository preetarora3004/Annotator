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
const allClients = new Map<string, { socket: WebSocket; isYjs: boolean }>();

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

const broadcastYjs = (data: Buffer | ArrayBuffer, senderId: string) => {
  allClients.forEach((clientInfo, id) => {
    if (id !== senderId && clientInfo.isYjs && clientInfo.socket.readyState === WebSocket.OPEN) {
      clientInfo.socket.send(data);
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

  let isYjsClient = false;
  let hasReceivedBinary = false;

  allClients.set(tokenFromQuery, { socket, isYjs: false });
  users.set(tokenFromQuery, socket);

  socket.on("message", async (data: WebSocket.RawData, isBinary) => {
    if (isBinary) {
      
      if (!hasReceivedBinary) {
        hasReceivedBinary = true;
        isYjsClient = true;
        const clientInfo = allClients.get(tokenFromQuery);
        if (clientInfo) {
          clientInfo.isYjs = true;
        }
      }
      
      const buffer = Buffer.from(data as ArrayBuffer);
      broadcastYjs(buffer, tokenFromQuery);
    } else {
  
      try {
        const text = data.toString();
        
        try {
          const message: Message = JSON.parse(text);
          
          broadcast(message, tokenFromQuery);
        } catch {
          if (isYjsClient) {
            broadcastYjs(Buffer.from(text), tokenFromQuery);
          }
        }
      } catch (err) {
        console.error("Error handling message:", err);
      }
    }
  });

  socket.on("close", () => {
    users.delete(tokenFromQuery);
    allClients.delete(tokenFromQuery);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});