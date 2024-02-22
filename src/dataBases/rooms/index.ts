import { User } from "../../interfaces/user";

class RoomsDatabase {
  public data: Room[] = [];

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

  isHaveUserRoom = (user: User) => {
    return this.data.some((elem) => elem.roomUsers[0].index === user.index);
  };

  removeUserRoom = (user: User) => {
    if (this.isHaveUserRoom(user)) {
      const roomIndexInData = this.data.findIndex(
        (elem) => elem.roomUsers[0].index === user.index
      );
      delete this.data[roomIndexInData];
    }
  };

  getRoomById(roomId: number): Room {
    return this.data[roomId - 1];
  }

  get getAvailableRoomList() {
    if (this.data.length) {
      return this.data.filter((elem) => elem.roomUsers.length === 1);
    }
  }
}

interface Room {
  roomId: number;
  roomUsers: Omit<User, "password">[];
}

export const roomsDatabase = new RoomsDatabase();
