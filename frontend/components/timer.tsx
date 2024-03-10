import React, { useEffect, useState } from "react";

export default function Chat({ socket }) {
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
