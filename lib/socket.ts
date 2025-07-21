// utils/socket.ts
import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server, {
      path: "/api/socket.io", 
      cors: {
        origin: "*", 
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join-room", (docId) => {
        socket.join(docId);
        console.log(`User ${socket.id} joined ${docId}`);
      });

      socket.on("send-changes", ({ docId, delta }) => {
        socket.to(docId).emit("receive-changes", delta);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
      socket.on("cursor-update", (data) => {
         const { docId, userId, cursor } = data;
           socket.to(docId).emit("cursor-update", {
         userId,
              cursor
  });
});
    });
  }
  return io;
};
