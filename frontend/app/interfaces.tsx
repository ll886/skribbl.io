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

export interface Game {
  id: string;
  rules: GameRules;
  hasStarted: boolean;
  players: GamePlayers;
  playerOrder: string[];
  hostPlayerId: string | undefined;
}
