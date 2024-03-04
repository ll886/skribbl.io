"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

function Home() {
  const router = useRouter();
  const [guestId, setGuestId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const guestId = Cookies.get("guestId");
    if (guestId) {
      setGuestId(guestId);
    } else {
      setMessage("Enter a name to play!");
    }
  }, []);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;
    setGuestId(newValue);
    Cookies.set("guestId", newValue);
    if (!newValue) {
      setMessage("Enter a name to play!");
    } else {
      setMessage("");
    }
  }

  return (
    <div>
      <h1>skribbl.io</h1>
      <div>{message}</div>
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
      </div>
      <div>
        <button
          onClick={() => {
            router.push(`/MakeRoom`);
          }}
        >
          Create Private Room
        </button>
      </div>
    </div>
  );
}

export default Home;
