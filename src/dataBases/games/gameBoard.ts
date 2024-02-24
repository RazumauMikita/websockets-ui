export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipType;
}

export type AttackStatus = 'miss' | 'shot' | 'killed';
interface Position {
  x: number;
  y: number;
}

export interface Cell {
  data: string;
  position: Position;
}
export class GameBoard {
  public data = new Array(10).fill([]).map(() => new Array(10).fill('0'));

  public boardCell: number = 20;

  public ships: Ship[];

  constructor(ships: Ship[]) {
    this.ships = ships;
  }

  getMissCellsAroundKilledShip = (position: Position) => {
    const { x, y } = position;
    const topCell: Cell | null = y - 1 < 0
      ? null
      : { data: this.data[y - 1][x], position: { y: y - 1, x } };

    const rightCell: Cell | null = x + 1 > 9
      ? null
      : { data: this.data[y][x + 1], position: { y, x: x + 1 } };

    const bottomCell: Cell | null = y + 1 > 9
      ? null
      : { data: this.data[y + 1][x], position: { y: y + 1, x } };

    const leftCell: Cell | null = x - 1 < 0
      ? null
      : { data: this.data[y][x - 1], position: { y, x: x - 1 } };

    const topRightCell: Cell | null = topCell && rightCell
      ? { data: this.data[y - 1][x + 1], position: { y: y - 1, x: x + 1 } }
      : null;

    const rightBottomCell: Cell | null = rightCell && bottomCell
      ? { data: this.data[y + 1][x + 1], position: { y: y + 1, x: x + 1 } }
      : null;

    const bottomLeftCell: Cell | null = bottomCell && leftCell
      ? { data: this.data[y + 1][x - 1], position: { y: y + 1, x: x - 1 } }
      : null;

    const leftTopCell: Cell | null = leftCell && topCell
      ? { data: this.data[y - 1][x - 1], position: { y: y - 1, x: x - 1 } }
      : null;

    const resultArray: Array<Cell | null> = [
      topCell,
      rightCell,
      bottomCell,
      leftCell,
      topRightCell,
      rightBottomCell,
      bottomLeftCell,
      leftTopCell,
    ];

    const missCells = resultArray.filter(
      (el) => el && (el.data === '0' || el.data === 'M'),
    );
    /* const ship = resultArray.filter((elem) => elem && elem.data.length > 1);
    if (ship.length) {
      ship.forEach((elem) => {
        if (elem)
          missCells.push(...this.getMissCellsAroundKilledShip(elem?.position));
      });
    } */
    return missCells;
  };

  generateRandomAttack = (): Position => {
    let x: number;
    let y: number;
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    while (this.data[y][x] === 'M') {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    }
    return { x, y };
  };

  getAttackResult = (x: number, y: number): AttackStatus => {
    const attackedCell = this.data[y][x];
    switch (attackedCell) {
      case 1:
        this.data[y][x] = 'X';
        this.makeHit();

        return 'killed';
      case 2:
      case 3:
      case 4:
        if (this.doesShipRemained(x, y)) {
          this.data[y][x] = `${attackedCell}X`;
          this.makeHit();
          return 'shot';
        }
        this.data[y][x] = `${attackedCell}X`;
        this.makeHit();
        return 'killed';

      default:
        this.data[y][x] = 'M';
        return 'miss';
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

  isPlayerLoose = (): boolean => this.boardCell < 1;

  addShipsToBoard = (): void => {
    this.ships.forEach((elem) => {
      const { x, y } = elem.position;
      const { length, direction } = elem;
      this.data[y][x] = length;
      if (elem.length > 1) {
        for (let i = 1; i < length; i += 1) {
          if (direction) {
            this.data[y + i][x] = length;
          } else {
            this.data[y][x + i] = length;
          }
        }
      }
    });
  };
}
