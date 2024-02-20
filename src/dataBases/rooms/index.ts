import { User } from "../../interfaces/user";

class RoomsDatabase {
  private data: Room[] = [];

  createRoom = (user: User): void => {
    const newRoom: Room = {
      roomId: this.data.length + 1,
      roomUsers: [user],
    };
    this.data.push(newRoom);
  };

  addUserToRoom = (indexRoom: number, user: Omit<User, "password">) => {
    this.data[indexRoom - 1].roomUsers.push(user);
  };

  get getAvailableRoomList() {
    return this.data.filter((elem) => elem.roomUsers.length === 1);
  }
}

interface Room {
  roomId: number;
  roomUsers: Omit<User, "password">[];
}

export const roomsDatabase = new RoomsDatabase();
