import { error } from "console";
import { Server, Socket } from "socket.io";

export class Game {
  gameStatus: "not-started" | "in-progress" | "finished";
  gameID: string;
  players: { id: string; score: number; name: string }[];
  io: Server;
  gameHost: string;
  paragraph: string;

  constructor(id: string, io: Server, host: string) {
    this.gameID = id;
    this.players = [];
    this.io = io;
    this.gameHost = host;
    this.gameStatus = "not-started";
    this.paragraph = "";
  }

  setupListeners(socket: Socket) {}

  joinPlayers(id: string, name: string, socket: Socket) {
    if (this.gameStatus == "in-progress")
      return socket.emit("error", "Game has already Started!");

    this.players.push({ id, name, score: 0 });

    this.io.to(this.gameID).emit("player joined", {
      id,
      name,
      score: 0,
    });

    socket.emit("player", this.players);
    socket.emit("new-host", this.gameHost);

    this.setupListeners(socket);
  }
}
