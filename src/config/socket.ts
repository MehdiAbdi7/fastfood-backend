import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

export let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connecté:", socket.id);

    socket.on("join_dashboard", () => {
      socket.join("dashboard");
      console.log(`${socket.id} a rejoint la room dashboard`);
    });

    socket.on("join_order_tracking", (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`${socket.id} suit la commande order:${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client déconnecté:", socket.id);
    });
  });

  return io;
}
