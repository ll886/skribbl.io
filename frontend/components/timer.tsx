import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export default function Timer({ socket }: {socket: Socket}) {
  const [timerValue, setTimerValue] = useState<number | null>(null);

  useEffect(() => {
    const handleTimerTick = (value: number) => {
      setTimerValue(value);
    };

    socket.on("timerTick", handleTimerTick);
  }, []);

  return (
    <div>
      {timerValue !== null && (
        <div className="timer">Timer: {timerValue} seconds</div>
      )}
    </div>
  );
}
