import { Container } from 'inversify';
import { IUserService } from './interface/iuser-service';
import { UserService } from './user-service';
import { IUserDao } from './interface/iuser-dao';
import { UserDao } from './user-dao';

export class UserDetailsIOC {
  static getContainer(): Container {
    const userDetailsContainer = new Container();

    userDetailsContainer
      .bind<IUserService>(Symbol.for('IUserService'))
      .to(UserService)
      .inSingletonScope();

      userDetailsContainer
      .bind<IUserDao>(Symbol.for('IUserDao'))
      .to(UserDao)
      .inSingletonScope();

    return userDetailsContainer;
  }
}
