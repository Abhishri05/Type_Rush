"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();

  function joinGame(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const inviteCode = formData.get("inviteCode") as string;

    if (!inviteCode) return toast.error("Invite code is required");

    router.push(`/game/${inviteCode}`);
  }

  function createGame() {
    const inviteCode = uuidv4();
    router.push(`/game/${inviteCode}`);
  }

  return (
    <main className="w-full mx-auto max-w-5xl p-5">
      <h1 className="font-bold text-4xl mt-10">Type Rush </h1>
      <p className="mt-5 text-amber-400 text-lg">
        <b>Master the Keys, Conquer the Words</b>
        <br></br>
        <i>
          It's time to put your typing skills to the test in a thrilling
          competition and let your fingers dance across the keyboard Take your
          buddies on a typing competition to see who can type the fastest in
          less than a minute! To begin, create or join a game,
        </i>{" "}
        You can play Solo as well!!!
      </p>
      <Card className="p-5 mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-medium text-2xl">Create Game</h2>
            <p className="text-yellow-400 mt-5">
              Make a game and ask your friends to participate in a typing race
              against you!!! <br></br>The game will be hosted by you.
            </p>
          </div>

          <div>
            <Button className="mt-5 w-full" onClick={createGame}>
              Create Game
            </Button>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-medium text-2xl">Join Game</h2>
            <p className="text-yellow-400 mt-5">
              Enter the invitation code and join your friends to compete in a
              typing race. May the most skilled individual emerge victorious!
            </p>
          </div>

          <div className="mt-5">
            <form onSubmit={joinGame}>
              <Input type="text" placeholder="Invite code" name="inviteCode" />
              <Button className="mt-3 w-full">Join Game</Button>
            </form>
          </div>
        </div>
      </Card>
    </main>
  );
}
