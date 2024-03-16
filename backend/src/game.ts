import { wait } from "./util.js";
import { chooseEasyWord } from "./words.js";

interface Player {
  id: string;
  points: number;
}

interface GameRules {
  drawTime: number;
  numRounds: number;
}

interface GamePlayers {
  [playerId: string]: Player;
}

interface PlayerGuess {
  playerId: string;
  guess: string;
}

interface PlayerRound {
  artistId: string;
  playerGuesses: PlayerGuess[];
  playerCorrectGuessOrder: string[];
}

interface Round {
  playerRounds: PlayerRound[];
}

interface Game {
  id: string;
  rules: GameRules;
  hasStarted: boolean;
  players: GamePlayers;
  playerOrder: string[];
  hostPlayerId: string | undefined;
  currentRound: number;
  currentArtistId: string | undefined;
  pastWords: string[];
  roundHistory: Round[];
}

interface Games {
  [gameId: string]: Game;
}

interface GameEventHandler {
  tickTime: (message: number) => void;
  sendMessage: (message: string) => void;
  updateGameState: (gameState: Game) => void;
  sendDrawWordInfo: (word: string, artistId: string) => void;
  sendGuessWordInfo: (wordLength: number, guesserIds: string[]) => void;
  sendPlayerRoundResult: (data: { [playerId: string]: number }) => void;
  endGame: () => void;
}

let games: Games = {};

function gameLog(gameId: string, message: string | object) {
  console.log({ gameId, message });
}

function playerLog(gameId: string, playerId: string, message: string) {
  gameLog(gameId, {
    playerId,
    message,
  });
}

function registerGameRoom(game: Game) {
  if (games.hasOwnProperty(game.id)) {
    throw new Error("gameId already exists");
  }
  games[game.id] = game;
  gameLog(game.id, "created room");
}

function addPlayerToGame(gameId: string, playerId: string) {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }

  if (playerId === undefined) {
    throw new Error("player does not have an id");
  }

  if (games[gameId].players.hasOwnProperty(playerId)) {
    throw new Error("playerId already registered in game");
  }

  const isFirstPlayer = Object.keys(games[gameId].players).length === 0;
  const points = 0;
  games[gameId].players[playerId] = { id: playerId, points };
  games[gameId].playerOrder.push(playerId);
  if (isFirstPlayer) {
    games[gameId].hostPlayerId = playerId;
  }

  playerLog(gameId, playerId, "added player");
}

function removePlayerFromGame(gameId: string, playerId: string) {
  if (games.hasOwnProperty(gameId)) {
    if (games[gameId].players.hasOwnProperty(playerId)) {
      const updatedPlayerOrder = games[gameId].playerOrder.filter(
        (pId) => pId !== playerId
      );
      delete games[gameId].players[playerId];
      games[gameId].playerOrder = updatedPlayerOrder;

      playerLog(gameId, playerId, "removed player");
      if (updatedPlayerOrder.length === 0) {
        console.log(updatedPlayerOrder);

        console.log(games[gameId].players);
        delete games[gameId];
        gameLog(gameId, "all players have left");
        gameLog(gameId, "game deleted");
      } else {
        if (
          games[gameId].hostPlayerId === playerId &&
          games[gameId].playerOrder.length > 0
        ) {
          const newHostId = games[gameId].playerOrder[0];
          games[gameId].hostPlayerId = newHostId;
        }
      }
    }
  }
}

function getGames(): Games {
  return games;
}

function getGameState(gameId: string): Game {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }
  return games[gameId];
}

function startGame(gameId: string, eventHandler: GameEventHandler): undefined {
  if (!games.hasOwnProperty(gameId)) {
    gameLog(gameId, "game room no longer exists, exiting game flow");
    return;
  }

  if (games[gameId].playerOrder.length > 1) {
    // recursively start rounds
    startRound(gameId, eventHandler);
  } else {
    eventHandler.sendMessage("You need at least 2 players to start the game!");
  }
}

async function startRound(
  gameId: string,
  eventHandler: GameEventHandler
): Promise<undefined> {
  if (!games.hasOwnProperty(gameId)) {
    gameLog(gameId, "game room no longer exists, exiting game flow");
    return;
  }
  let game = games[gameId];
  game.hasStarted = true;
  game.roundHistory.push({ playerRounds: [] });
  eventHandler.updateGameState(game);
  eventHandler.sendMessage(`starting round ${game.currentRound}`);

  const playerOrder = [...game.playerOrder];
  for (let i = 0; i < playerOrder.length; i++) {
    const playerId = playerOrder[i];
    game.currentArtistId = playerId;
    game.roundHistory[game.currentRound - 1].playerRounds.push({
      artistId: game.currentArtistId,
      playerGuesses: [],
      playerCorrectGuessOrder: [],
    });

    const word = chooseEasyWord(game.pastWords);
    game.pastWords.push(word);
    eventHandler.sendDrawWordInfo(word, game.currentArtistId);
    eventHandler.sendGuessWordInfo(word.length, getGuesserIds(game));
    eventHandler.sendMessage(`${game.currentArtistId} is drawing now!`);

    for (
      let timeRemaining = game.rules.drawTime;
      timeRemaining >= 0;
      timeRemaining--
    ) {
      if (endGameIfEligible(game, eventHandler)) {
        return;
      }

      evaluateCurrentPlayerRound(game, word, eventHandler);
      if (allCorrectInCurrentPlayerRound(game)) {
        break;
      }
      eventHandler.tickTime(timeRemaining);
      await wait(1);
    }

    const playerPointsEarned = getPointsEarnedForPlayerRound(game);
    eventHandler.sendPlayerRoundResult(playerPointsEarned);
    eventHandler.sendMessage(`The word was '${word}'`);
    for (const [playerId, points] of Object.entries(playerPointsEarned)) {
      game.players[playerId].points = points;
      eventHandler.sendMessage(`${playerId} earned ${points} points!`);
    }
    eventHandler.updateGameState(game);

    for (let timeRemaining = 5; timeRemaining >= 0; timeRemaining--) {
      if (endGameIfEligible(game, eventHandler)) {
        return;
      }

      eventHandler.tickTime(timeRemaining);
      await wait(1);
    }
  }

  game.currentRound++;
  if (endGameIfEligible(game, eventHandler)) {
    return;
  } else {
    startRound(gameId, eventHandler);
  }
}

function getGuesserIds(game: Game): string[] {
  const { players, currentArtistId } = game;

  return Object.keys(players).filter(
    (playerId) => playerId !== currentArtistId
  );
}

function evaluateCurrentPlayerRound(
  game: Game,
  word: string,
  eventHandler: GameEventHandler
) {
  let currentRound = game.roundHistory[game.roundHistory.length - 1];
  let currentPlayerRound =
    currentRound.playerRounds[currentRound.playerRounds.length - 1];

  currentPlayerRound.playerGuesses.forEach((playerGuess) => {
    if (
      playerGuess.playerId != game.currentArtistId &&
      playerGuess.guess === word &&
      !currentPlayerRound.playerCorrectGuessOrder.includes(playerGuess.playerId)
    ) {
      currentPlayerRound.playerCorrectGuessOrder.push(playerGuess.playerId);
      eventHandler.sendMessage(`${playerGuess.playerId} guessed the word!`);
    }
  });
}

function getPointsEarnedForPlayerRound(game: Game) {
  let pointsEarned: { [playerId: string]: number } = {};
  let currentRound = game.roundHistory[game.roundHistory.length - 1];
  let currentPlayerRound =
    currentRound.playerRounds[currentRound.playerRounds.length - 1];
  for (const playerId in game.players) {
    pointsEarned[playerId] = 0;
  }

  currentPlayerRound.playerCorrectGuessOrder.forEach((playerId, index) => {
    const points =
      (currentPlayerRound.playerCorrectGuessOrder.length - index) * 50;

    if (playerId in pointsEarned) {
      pointsEarned[playerId] += points;
    }
  });

  if (
    game.currentArtistId !== undefined &&
    game.currentArtistId in pointsEarned
  ) {
    pointsEarned[game.currentArtistId] +=
      currentPlayerRound.playerCorrectGuessOrder.length * 20;
  }

  const sortedPointsEarned = Object.fromEntries(
    Object.entries(pointsEarned).sort(([, a], [, b]) => b - a)
  );

  return sortedPointsEarned;
}

function allCorrectInCurrentPlayerRound(game: Game): boolean {
  let currentRound = game.roundHistory[game.roundHistory.length - 1];
  let currentPlayerRound =
    currentRound.playerRounds[currentRound.playerRounds.length - 1];
  return (
    currentPlayerRound.playerCorrectGuessOrder.length ==
    game.playerOrder.length - 1
  );
}

function endGameIfEligible(
  game: Game,
  eventHandler: GameEventHandler
): boolean {
  if (
    game.currentRound > game.rules.numRounds ||
    game.playerOrder.length === 1
  ) {
    endGame(game, eventHandler);
    return true;
  }
  return false;
}

function endGame(game: Game, eventHandler: GameEventHandler) {
  eventHandler.updateGameState(game);
  const playersArray = Object.values(game.players);
  const player = playersArray.reduce((prevPlayer, currentPlayer) =>
    prevPlayer.points > currentPlayer.points ? prevPlayer : currentPlayer
  );
  eventHandler.sendMessage(
    `${player.id} won with a score of ${player.points}!`
  );
  eventHandler.tickTime(0);
  eventHandler.endGame();
}

function recordPlayerMessage(
  gameId: string,
  playerId: string,
  message: string
) {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }

  let game = games[gameId];

  if (game.hasStarted) {
    let currentRound = game.roundHistory[game.roundHistory.length - 1];
    let currentPlayerRound =
      currentRound.playerRounds[currentRound.playerRounds.length - 1];
    currentPlayerRound.playerGuesses.push({
      playerId: playerId,
      guess: message,
    });
  }
}

export {
  Player,
  Game,
  registerGameRoom,
  addPlayerToGame,
  removePlayerFromGame,
  getGames,
  getGameState,
  startGame,
  recordPlayerMessage,
  GameEventHandler,
};
