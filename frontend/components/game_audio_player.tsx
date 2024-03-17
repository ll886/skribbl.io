"use client";

import { getAudio } from "@/app/audio";
import { useEffect, useState } from "react";

export default function GameAudioPlayer({ socket }) {
  useEffect(() => {
      socket.on("startPlayerRound", () => {
        let audio = getAudio("roundTransition");
        audio.play();
      })

      socket.on("playerRoundResult", () => {
        let audio = getAudio("roundTransition");
        audio.play();
      })

      socket.on("playerJoined", () => {
        let audio = getAudio("click");
        audio.play();
      })

      socket.on("playerLeft", () => {
        let audio = getAudio("pop");
        audio.play();
      })

      socket.on("playerGuessedCorrect", () => {
        let audio = getAudio("click");
        audio.play();
      })

      socket.on("endGame", () => {
        let audio = getAudio("gameOver");
        audio.play();
      })
  })

  return (<div></div>);
}
