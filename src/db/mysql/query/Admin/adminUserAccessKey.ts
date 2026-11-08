import { MySqlQuery } from '../@common';
import { type AdminUserAccessKeyId, AdminUserAccessKeyType } from '@const';

class AdminUserAccessKey extends MySqlQuery<'adminUserAccessKey'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminUserAccessKey');
  }

  /********************************************************************************************************************
   * 등록/수정
   ********************************************************************************************************************/
  async addEdit({ id, type, title }: { id: AdminUserAccessKeyId; type: AdminUserAccessKeyType; title: string }) {
    if (await this.existsByPrimaryKey(id)) {
      return this.editByPrimaryKey({ type, title }, id);
    } else {
      return this.add({ id, type, title });
    }
  }
}

export const adminUserAccessKey = new AdminUserAccessKey();

export type AdminUserAccessKey$AddValues = ReturnType<typeof adminUserAccessKey.addValues>;
export type AdminUserAccessKey$EditValues = ReturnType<typeof adminUserAccessKey.editValues>;
