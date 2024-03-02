"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { serverUrl } from "@/app/config";

const Random = () => {
  const router = useRouter();

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch(`${serverUrl}/api/rooms`);
        const games = await response.json();

        if (games.length > 0) {
          const randomGame = games[Math.floor(Math.random() * games.length)];
          router.push(`/rooms/${randomGame.id}`);
        } else {
          router.push("/rooms/create");
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchGames();
  }, []);

  return null;
};

export default Random;
