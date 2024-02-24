import { v4 as uuid } from 'uuid';

import { User } from '../../interfaces/user';

class UserDatabase {
  private data: User[] = [];

  addNewUser = (user: Omit<User, 'id'>): void => {
    const newUser: User = {
      ...user,
      index: uuid(),
    };
    this.data.push(newUser);
  };

  getUserIndex = (user: Omit<User, 'id'>) => this.getUserFromBase(user)?.index || '';

  getUserByIndex = (userIndex: string) => this.data.find((elem) => elem.index === userIndex);

  isPasswordCorrect = (user: Omit<User, 'id'>) => this.getUserFromBase(user)?.password === user.password;

  getUserFromBase = (user: Omit<User, 'id'>): User | undefined => this.data.find((elem: User) => user.name === elem.name);

  isUserExist = (user: Omit<User, 'id'>) => this.data.some((elem: User) => user.name === elem.name);
}

export const userDatabase = new UserDatabase();
