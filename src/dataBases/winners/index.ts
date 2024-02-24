interface Winner {
  name: string;
  wins: number;
}

class WinnersDatabase {
  private data: Winner[] = [];

  updateWinners = (name: string) => {
    const winner = this.getWinner(name);
    if (winner) {
      const winnerIndex = this.data.indexOf(winner);
      this.data[winnerIndex].wins += 1;
    } else {
      const newWinner: Winner = {
        name,
        wins: 1,
      };
      this.data.push(newWinner);
    }
  };

  getWinner = (name: string): Winner | undefined => this.data.find((elem) => elem.name === name);

  get getWinners() {
    return this.data;
  }
}

export const winnersDatabase = new WinnersDatabase();
