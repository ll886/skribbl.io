interface Player {
  id: string;
}

interface GameRules {
  drawTime: number;
  numRounds: number;
}

interface PlayerDetails {
  player: Player;
  points: number;
}

interface GamePlayers {
  [playerId: string]: PlayerDetails;
}

interface Game {
  id: string;
  rules: GameRules;
  hasStarted: boolean;
  players: GamePlayers;
  playerOrder: string[];
  canvasState: string;
}

interface Games {
  [gameId: string]: Game;
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

function addPlayerToGame(gameId: string, player: Player) {
  if (!games.hasOwnProperty(gameId)) {
    throw new Error("invalid gameId");
  }

  if (player.id === undefined) {
    throw new Error("player does not have an id");
  }

  if (games[gameId].players.hasOwnProperty(player.id)) {
    throw new Error("playerId already registered in game");
  }

  const points = 0;
  games[gameId].players[player.id] = { player, points };
  games[gameId].playerOrder.push(player.id);

  playerLog(gameId, player.id, "added player");
}

function removePlayerFromGame(gameId: string, player: Player) {
  if (games.hasOwnProperty(gameId)) {
    if (games[gameId].players.hasOwnProperty(player.id)) {
      const updatedPlayerOrder = games[gameId].playerOrder.filter(
        (playerId) => playerId !== player.id
      );
      delete games[gameId].players[player.id];
      games[gameId].playerOrder = updatedPlayerOrder;

      playerLog(gameId, player.id, "removed player");
      if (updatedPlayerOrder.length === 0) {
        delete games[gameId];
        gameLog(gameId, "all players have left");
        gameLog(gameId, "game deleted");
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

function storeCanvasState(gameId: string, state: string): void {
  games[gameId].canvasState = state;
}

function clearCanvasState(gameId: string): void {
  games[gameId].canvasState = "";
}

export {
  Player,
  Game,
  registerGameRoom,
  addPlayerToGame,
  removePlayerFromGame,
  getGames,
  getGameState,
  storeCanvasState,
  clearCanvasState,
};
