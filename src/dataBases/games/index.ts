import { User } from "../../interfaces/user";

class GamesDatabase {
  public data: Game[] = [];

  createNewGame = (players: Player[]): number => {
    const newGame: Game = {
      gameId: this.data.length,
      players: players,
    };
    this.data.push(newGame);
    return newGame.gameId;
  };

  addShipsToPlayer = (ships: Ship[], gameId: number, indexPlayer: string) => {
    const playerArrayIndex = this.data[gameId].players.findIndex(
      (elem) => elem.user.index === indexPlayer
    );
    console.log(indexPlayer);
    this.data[gameId].players[playerArrayIndex].ships = ships;
  };

  isGameReady = (gameId: number) => {
    return this.data[gameId].players.every((elem) => elem.ships);
  };
}

export const gamesDatabase = new GamesDatabase();

export interface Game {
  gameId: number;
  players: Player[];
}

export interface Player {
  user: Omit<User, "password">;
  ships?: Ship[];
}

export type ShipType = "small" | "medium" | "large" | "huge";
export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}
