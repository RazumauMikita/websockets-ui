import { Ship } from ".";

export type AttackStatus = "miss" | "shot" | "killed";

export class GameBoard {
  public data = new Array(10).fill([]).map(() => new Array(10).fill(0));
  public boardCell: number = 20;
  public ships: Ship[];

  constructor(ships: Ship[]) {
    this.ships = ships;
  }

  getAttackResult = (x: number, y: number): AttackStatus => {
    const attackedCell = this.data[y][x];
    switch (attackedCell) {
      case 1:
        this.data[y][x] = "X";
        this.makeHit();
        return "killed";
      case 2:
      case 3:
      case 4:
        if (this.doesShipRemained(x, y)) {
          this.data[y][x] = `${attackedCell}X`;
          this.makeHit();
          return "shot";
        } else {
          this.data[y][x] = `${attackedCell}X`;
          this.makeHit();
          return "killed";
        }

      default:
        return "miss";
    }
  };

  doesShipRemained = (x: number, y: number) => {
    const attackedCell = this.data[y][x];
    const topCell = y - 1 < 0 ? null : this.data[y - 1][x];
    const rightCell = x + 1 > 9 ? null : this.data[y][x + 1];
    const bottomCell = y + 1 > 9 ? null : this.data[y + 1][x];
    const leftCell = x - 1 < 0 ? null : this.data[y][x - 1];

    switch (attackedCell) {
      case topCell:
      case rightCell:
      case bottomCell:
      case leftCell:
        return true;

      default:
        return false;
    }
  };

  makeHit = (): void => {
    this.boardCell -= 1;
  };

  isPlayerLoose = (): boolean => {
    return this.boardCell < 1;
  };
  addShipsToBoard = (): void => {
    this.ships.forEach((elem) => {
      const { x, y } = elem.position;
      const { length, direction } = elem;
      this.data[y][x] = length;
      if (elem.length > 1) {
        for (let i = 1; i < length; i += 1) {
          direction
            ? (this.data[y + i][x] = length)
            : (this.data[y][x + i] = length);
        }
      }
    });
  };
}
