import express from 'express';
import { z } from "zod";
import { parseError } from './errors.js';
import { generateRandomString } from './util.js';
import { Game, getGames, registerGameRoom, } from './game.js';

const router = express.Router();

const postSchema = z.object({
    drawTime: z.number().refine((drawTime) => drawTime >= 15 && drawTime <= 100, {
      message: 'Draw time must be between 15 and 100',
    }),
    numRounds: z.number().refine((numRounds) => numRounds >= 1 && numRounds <= 5, {
      message: 'Number of rounds must be between 1 and 5',
    }),
    isPrivate: z.boolean(),
});

router.get("/", async (req, res) => {
  const games = getGames();
  const publicGames = Object.values(games).filter((game) => !game.isPrivate).map((game) => ({ id: game.id }));
  return res.json(publicGames);
});

router.post("/", async (req, res) => {
    const parseResult = postSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ errors: parseError(parseResult.error)})
    }
    const { drawTime, numRounds, isPrivate } = parseResult.data;
    const roomId = generateRandomString(6);
    const game: Game = {
        id: roomId,
        rules: { drawTime, numRounds },
        isPrivate: isPrivate,
        hasStarted: false,
        players: {},
        playerOrder: [],
        canvasState: "",
        hostPlayerId: undefined,
        currentRound: 1,
        currentArtistId: undefined,
        pastWords: [],
        roundHistory: [],
        currentWord: undefined,
    }
    registerGameRoom(game);
    return res.json(game);
})

export default router