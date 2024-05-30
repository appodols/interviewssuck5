import Image from "next/image";
import Microphone from "./microphone";
import Recommender from "./Recommender";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[#DB5A30]">
      <div className="relative flex flex-col w-screen max-w-screen-lg place-items-center">
        <Microphone />
        <Recommender />
      </div>
    </main>
  );
}