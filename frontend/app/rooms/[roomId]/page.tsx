"use client";

import { useParams } from "next/navigation";
import socket from "@/app/socket";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Canvas from "@/components/canvas";
import Chat from "@/components/chat";
import { generateGuestIdIfNull } from "@/app/names";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

  useEffect(() => {
    socket.connect();
    console.log("connecting socket...");
    generateGuestIdIfNull();

    socket.on("connect", () => {
      console.log("socket connected");
      socket.emit("joinRoom", roomId);
      console.log("joining room");

      socket.on("joinGameError", () => {
        console.log("error joining room");
        console.log("room may not exist");
        router.push("/");
      });
    });

    return () => {
      console.log("disconnect socket");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-grow p-4">{<Canvas socket={socket} />}</div>
      <div className="w-1/4 p-4">
        <Chat socket={socket} />
      </div>
    </div>
  );
}

export default Page;
