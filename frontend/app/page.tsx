"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

function Home() {
  const router = useRouter();
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    const guestId = Cookies.get("guestId");
    if (guestId) {
      setGuestId(guestId);
    }
  }, []);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;
    setGuestId(newValue);
    Cookies.set("guestId", newValue);
  }

  return (
    <>
      <Navbar />
      <div>
        <h1>skribbl.io</h1>
        <label>
          Player Name
          <input type="text" value={guestId} onChange={handleInputChange} />
        </label>

        <div>
          <button
            onClick={() => {
              router.push(`/rooms/random`);
            }}
          >
            Play!
          </button>
          <button
            onClick={() => {
              router.push(`/rooms/create`);
            }}
          >
            Create Private Room
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
