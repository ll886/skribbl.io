"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Socket } from "socket.io-client";

export default function Round({ socket }: { socket: Socket }) {
  const [round, setRound] = useState<number | "END">(0);
  const [rounds, setRounds] = useState<number>(0);

  useEffect(() => {
    socket.on("updateGameState", (updatedGameState) => {
      setRound(updatedGameState.currentRound);
      setRounds(updatedGameState.rules.numRounds);
    });

    socket.on("endGame", () => {
      setRound("END");
    });
  }, [socket]);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="body1">
        ROUND: {round} / {rounds}
      </Typography>
    </Box>
  );
}
