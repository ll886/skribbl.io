"use client";

import { useParams } from "next/navigation";
import socket from "@/app/socket";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/components/canvas";
import Chat from "@/components/chat";
import { getGuestId } from "@/app/names";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

  useEffect(() => {
    socket.connect();

    const guestId = getGuestId();
    socket.emit("joinRoom", roomId, { id: guestId });

    socket.on("joinGameError", () => {
      console.log("error joining room");
      console.log("room may not exist");
      router.push("/rooms/create");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-grow p-4">{Canvas()}</div>
      <div className="w-1/4 p-4">
        <Chat socket={socket} />
      </div>
    </div>
  );
}

export default Page;
