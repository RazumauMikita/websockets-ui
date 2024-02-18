import { v4 as uuid } from "uuid";

class UserDatabase {
  private data: StoredUser[] = [];

  addNewUser = (user: User): void => {
    if (!this.isUserExist(user)) {
      const newUser: StoredUser = {
        ...user,
        id: uuid(),
      };
      this.data.push(newUser);
    }
  };

  isUserExist = (user: User) => {
    return this.data.some((elem: User) => user.name === elem.name);
  };
}

interface User {
  name: string;
  password: string;
}

interface StoredUser extends User {
  id: string;
}
