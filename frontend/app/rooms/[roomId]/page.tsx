"use client";

import { useParams } from "next/navigation";
import socket from "@/app/socket";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/components/canvas";
import Chat from "@/components/chat";
import Timer from "@/components/timer";
import Round from "@/components/round";
import { generateGuestIdIfNull } from "@/app/names";
import { Game } from "@/app/interfaces";
import Word from "@/components/word";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();
  const currentURL = useRef(`${window.location.origin}/rooms/${roomId}`);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState<Game | null>(null);
  const [drawWordInfo, setDrawWordInfo] = useState<string>("");

  useEffect(() => {
    generateGuestIdIfNull();
    socket.connect();
    console.log("connecting socket...");

    socket.on("connect", () => {
      console.log("socket connected");
      socket.emit("joinRoom", roomId);
      console.log("joining room");

      socket.on("joinGameError", () => {
        console.log("error joining room");
        console.log("room may not exist");
        router.push("/");
      });

      socket.on("currentUser", ({ playerId }) => {
        console.log("Received currentUser event:", playerId);
        setPlayerId(playerId);
      });

      socket.on("updateGameState", (updatedGameState) => {
        console.log("Received updateGameState event:", updatedGameState);
        setGameState(updatedGameState);
      });
    });

    return () => {
      console.log("disconnect socket");
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentURL.current);
      console.log("Link copied to clipboard!");
      setIsLinkCopied(true);

      setTimeout(() => {
        setIsLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const handleStartGame = () => {
    socket.emit("startGame");
  };

  const isHost = playerId === gameState?.hostPlayerId;
  const isGameNotStarted = !gameState?.hasStarted;

  return (
    <div className="flex h-screen bg-white">
      <Word socket={socket} />
      <div className="flex-grow p-4">
        <Canvas socket={socket} />
      </div>
      <div className="w-1/4 p-4">
        <Round gameState={gameState} />
        <Chat socket={socket} />

        <div>
          <button onClick={handleCopyLink} className="bg-blue-500 text-white">
            {isLinkCopied ? "Link Copied!" : "Copy invite link!"}
          </button>
        </div>

        {isHost && isGameNotStarted && (
          <div>
            <button
              onClick={handleStartGame}
              className="bg-blue-500 text-white"
            >
              Start Game
            </button>
          </div>
        )}
        <Timer socket={socket} />
      </div>
    </div>
  );
}

export default Page;
