import { redirect } from "next/navigation";

export default function NoIDProvidedGame() {
  return redirect("/");
}
