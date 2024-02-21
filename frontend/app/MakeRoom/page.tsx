'use client'
import React, { useState } from "react";
import "./MakeRoom.css";

const MakeRoom: React.FC = () => {
    const [players, setPlayers] = useState<number>(1);
    const [drawTime, setDrawTime] = useState<number>(20);
    const [rounds, setRounds] = useState<number>(2);
    const [hint, setHint] = useState<number>(1);

    const handlePlayersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPlayers(parseInt(e.target.value));
    };

    const handleDrawTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDrawTime(parseInt(e.target.value));
    };

    const handleRoundsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRounds(parseInt(e.target.value));
    };

    const handleHintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setHint(parseInt(e.target.value));
    };

    return (
        <div className="drawing-room-container">
            <h2>Create a Drawing Room</h2>
            <div className="option">
            <label>Players:</label>
            <select value={players} onChange={handlePlayersChange}>
                {[...Array(10)].map((_, index) => (
                <option key={index} value={index + 1}>
                    {index + 1}
                </option>
                ))}
            </select>
            </div>
            <div className="option">
            <label>Draw Time:</label>
            <select value={drawTime} onChange={handleDrawTimeChange}>
                {[...Array(11)].map((_, index) => (
                <option key={index} value={20 + index * 10}>
                    {20 + index * 10} seconds
                </option>
                ))}
            </select>
            </div>
            <div className="option">
            <label>Rounds:</label>
            <select value={rounds} onChange={handleRoundsChange}>
                {[...Array(4)].map((_, index) => (
                <option key={index} value={index + 2}>
                    {index + 2}
                </option>
                ))}
            </select>
            </div>
            <div className="option">
            <label>Hint:</label>
            <select value={hint} onChange={handleHintChange}>
                {[...Array(3)].map((_, index) => (
                <option key={index} value={index + 1}>
                    {index + 1}
                </option>
                ))}
            </select>
            </div>
        </div>
    );
};

export default MakeRoom;
