import { MySqlQuery } from '../@common';
import type { AdminGroupId, AdminUserId } from '@const';

class AdminGroupUser extends MySqlQuery<'adminGroupUser'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminGroupUser');
  }

  /********************************************************************************************************************
   * 그룹 ID 별 목록
   ********************************************************************************************************************/
  listOfGroup({ admin_group_id }: { admin_group_id: AdminGroupId }) {
    return this.select(['admin_user_id']).where(this.eq({ admin_group_id }));
  }

  /********************************************************************************************************************
   * 사용자 일괄 등록
   ********************************************************************************************************************/
  async addUsers({ admin_group_id, admin_user_ids }: { admin_group_id: AdminGroupId; admin_user_ids: AdminUserId[] }) {
    for (const admin_user_id of admin_user_ids) {
      await this.removeUser(admin_user_id);
      await this.add({ admin_group_id, admin_user_id });
    }
  }

  /********************************************************************************************************************
   * 사용자의 그룹 ID 수정
   ********************************************************************************************************************/
  editAdminGroupId({ admin_user_id, admin_group_id }: { admin_user_id: AdminUserId; admin_group_id: AdminGroupId }) {
    return this.edit({ admin_group_id }, this.eq({ admin_user_id }));
  }

  /********************************************************************************************************************
   * 사용자 삭제
   ********************************************************************************************************************/
  removeUser(admin_user_id: AdminUserId) {
    return this.remove(this.eq({ admin_user_id }));
  }

  /********************************************************************************************************************
   * 그룹의 모든 사용자 삭제
   ********************************************************************************************************************/
  removeAllUserOfGroup(admin_group_id: AdminGroupId) {
    return this.remove(this.eq({ admin_group_id }));
  }
}

export const adminGroupUser = new AdminGroupUser();

export type TAdminGroupUser = typeof adminGroupUser.t.$inferSelect;

export type AdminGroupUser$AddValues = ReturnType<typeof adminGroupUser.addValues>;
export type AdminGroupUser$EditValues = ReturnType<typeof adminGroupUser.editValues>;
