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
import Leaderboard from "@/components/leaderboard";
import { getAudio } from "@/app/audio";
import GameAudioPlayer from "@/components/game_audio_player";
import Navbar from "@/components/navbar";
import { Box, Button } from "@mui/material";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();
  const currentURL = useRef(`${window.location.origin}/rooms/${roomId}`);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState<Game | null>(null);

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
      const audio = getAudio("click");
      audio.play();
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
    const audio = getAudio("click");
    audio.play();
    socket.emit("startGame");
  };

  const isHost = playerId === gameState?.hostPlayerId;
  const isGameNotStarted = !gameState?.hasStarted;

  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-white">
        <div className="flex-grow px-4">
          <Leaderboard gameState={gameState} />
        </div>
        <div className="flex-grow px-4">
          <Word socket={socket} />
          <Canvas socket={socket} />
        </div>
        <div className="w-1/4 px-4">
          <Round socket={socket} />
          <Timer socket={socket} />
          <Chat socket={socket} />

          <br></br>

          <Box display="flex" gap={2}>
            <Box>
              <Button
                  onClick={handleCopyLink}
                  variant="contained"
                  color="primary"
                  style={{ backgroundColor: '#2196f3', color: 'white' }}
                  disabled={isLinkCopied}
              >
                  {isLinkCopied ? "Link Copied!" : "Copy invite link!"}
              </Button>
            </Box>

            <br></br>

            {isHost && isGameNotStarted && (
              <Box>
                <Button
                    onClick={handleStartGame}
                    variant="contained"
                    color="primary"
                    style={{ backgroundColor: '#2196f3' }}
                >
                    Start Game
                </Button>
              </Box>
            )}
          </Box>

          <GameAudioPlayer socket={socket} />
        </div>
      </div>
    </>
  );
}

export default Page;
