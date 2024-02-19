"use client";

import { useParams } from "next/navigation";
import socket from "@/app/socket";
import React, { useEffect } from "react";

function Page() {
  const { gameId } = useParams();

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  return <div></div>;
}

export default Page;