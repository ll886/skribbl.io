"use client";

import { useParams } from "next/navigation";
import socket from "@/app/socket";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
      router.push("/rooms/create");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <div></div>;
}

export default Page;
