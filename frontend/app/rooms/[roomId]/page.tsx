"use client";

import { useParams } from "next/navigation";
import socket from "@/app/socket";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Canvas from "@/components/canvas";

function Page() {
  const { roomId } = useParams();
  const router = useRouter();

  useEffect(() => {
    socket.connect();

    const guestId = Cookies.get("guestId");
    socket.emit("joinRoom", roomId, { id: guestId });

    socket.on("joinGameError", () => {
      console.log("error joining room");
      console.log("room may not exist");
      router.push("/MakeRoom");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div className="w-screen h-screen bg-white flex flex-wrap justify-center items-center">
        {Canvas()}
      </div>
    </>
  );
}

export default Page;
