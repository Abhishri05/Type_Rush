import { Server } from "socket.io";
import { Game } from "./classes/game";

export const rooms = new Map<string, Game>();

export function setupListeners(io: Server) {
  io.on("connection", (socket) => {
    console.log(`New Connection - ${socket.id}`);

    socket.on("join-game", (roomID: string, name: string) => {
      if (!roomID) return socket.emit("error", "Invalid Room ID");
      if (!name) return socket.emit("error", "Please Provide a Nickname.");

      socket.join(roomID);

      if (rooms.has(roomID)) {
        const game = rooms.get(roomID);
        if (!game) return socket.emit("error", "Game not Found ");
        game.joinPlayers(socket.id, name, socket);
      } else {
        const game = new Game(roomID, io, socket.id);
        rooms.set(roomID, game);
        game.joinPlayers(socket.id, name, socket);
      }
    });
  });
}
