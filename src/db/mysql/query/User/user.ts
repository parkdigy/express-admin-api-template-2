import { MySqlQuery } from '../@common';
import type { UserId } from '@const';

class User extends MySqlQuery<'user'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('user');
  }

  /********************************************************************************************************************
   * 로그인을 위한 정보
   * ******************************************************************************************************************/
  infoForSignIn(email: string) {
    return this.find(['id', 'password', 'email'], this.eq({ email }));
  }

  /********************************************************************************************************************
   * 로그인 정보
   * ******************************************************************************************************************/
  infoForSession(id: UserId) {
    return this.findByPrimaryKey(['id', 'email'], id);
  }
}

export const user = new User();

export type User$AddValues = ReturnType<typeof user.addValues>;
export type User$EditValues = ReturnType<typeof user.editValues>;
