import { getAudio } from "@/app/audio";
import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

export default function Timer({ socket }) {
  const [timerValue, setTimerValue] = useState<number | null>(null);
  let audio: HTMLAudioElement;

  useEffect(() => {
    const handleTimerTick = (value: number) => {
      setTimerValue(value);
      if (value === 5) {
        audio = getAudio("clock");
        audio.play();
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 6 * 1000);
      }
    };

    socket.on("timerTick", handleTimerTick);
    socket.on("playerRoundResult", () => {
      audio.pause();
    });
  }, []);

  return (
    <Box>
      {timerValue !== null && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1">
            Timer: {timerValue} seconds
          </Typography>
        </Box>
      )}
    </Box>
  );
}
