import { User } from '../../interfaces/user';

interface Room {
  roomId: number;
  roomUsers: Omit<User, 'password'>[];
}

class RoomsDatabase {
  public data: Room[] = [];

  createRoom = (user: User): number => {
    const newRoom: Room = {
      roomId: this.data.length + 1,
      roomUsers: [user],
    };
    this.data.push(newRoom);
    return this.data.length - 1;
  };

  addUserToRoom = (indexRoom: number, user: Omit<User, 'password'>) => {
    this.data[indexRoom - 1].roomUsers.push(user);
  };

  isHaveUserRoom = (user: User) => this.data.some((elem) => elem.roomUsers[0].index === user.index);

  removeUserRoom = (roomIndex: number) => {
    delete this.data[roomIndex];
  };

  getRoomById(roomId: number): Room {
    return this.data[roomId - 1];
  }

  getAvailableRoomList() {
    return this.data.filter((elem) => elem.roomUsers.length === 1) || '';
  }
}

export const roomsDatabase = new RoomsDatabase();
