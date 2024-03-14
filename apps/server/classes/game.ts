import { error } from "console";
import { Server, Socket } from "socket.io";
import { generateParagraph } from "../utils/generateParagraph";
import { rooms } from "../setupListener";

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

  setupListeners(socket: Socket) {
    socket.on("start-game", async () => {
      if (this.gameStatus === "in-progress")
        return socket.emit("error", "The game has Already Started");

      if (this.gameHost !== socket.id)
        return socket.emit(
          "error",
          "You are not the host, Only host can start the Game"
        );

      for (const player of this.players) {
        player.score = 0;
      }

      this.io.to(this.gameID).emit("players", this.players);
      this.gameStatus = "in-progress";

      const paragraph = await generateParagraph();

      this.paragraph = paragraph;
      this.io.to(this.gameID).emit("game-started", paragraph);

      setTimeout(() => {
        this.gameStatus = "finished";
        this.io.to(this.gameID).emit("game-finished");
        this.io.to(this.gameID).emit("players", this.players);
      }, 60000);
    });

    socket.on("player-typed", (typed: string) => {
      if (this.gameStatus !== "in-progress")
        return socket.emit("error", "The game has not started yet");

      const splittedParagraph = this.paragraph.split(" ");
      const splittedTyped = typed.split(" ");

      let score = 0;

      for (let i = 0; i < splittedTyped.length; i++) {
        if (splittedTyped[i] === splittedParagraph[i]) {
          score++;
        } else {
          break;
        }
      }

      const player = this.players.find((player) => player.id === socket.id);

      if (player) {
        player.score = score;
      }

      this.io.to(this.gameID).emit("player-score", { id: socket.id, score });
    });

    socket.on("leave", () => {
      if (socket.id === this.gameHost) {
        this.players = this.players.filter((player) => player.id !== socket.id);

        if (this.players.length !== 0) {
          this.gameHost = this.players[0].id;
          this.io.to(this.gameID).emit("new-host", this.gameHost);
          this.io.to(this.gameID).emit("player-left", socket.id);
        } else {
          rooms.delete(this.gameID);
        }
      }

      socket.leave(this.gameID);
      this.players = this.players.filter((player) => player.id !== socket.id);
      this.io.to(this.gameID).emit("player-left", socket.id);
    });

    socket.on("disconnect", () => {
      if (socket.id === this.gameHost) {
        this.players = this.players.filter((player) => player.id !== socket.id);

        if (this.players.length !== 0) {
          this.gameHost = this.players[0].id;
        } else {
          // Delete the game if the host leaves and there are no players
          rooms.delete(this.gameID);
        }
      }

      socket.leave(this.gameID);
      this.players = this.players.filter((player) => player.id !== socket.id);
    });
  }

  joinPlayers(id: string, name: string, socket: Socket) {
    if (this.gameStatus === "in-progress")
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
