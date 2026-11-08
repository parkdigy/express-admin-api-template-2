import { MySqlQuery } from '../@common';

class AdminGroup extends MySqlQuery<'adminGroup'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminGroup');
  }

  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  list(options?: { is_lock?: boolean; user_count?: boolean }) {
    const ag = db.a.adminGroup();
    const agu = db.a.adminGroupUser();

    return this.select(ag, [
      db.columns(ag, 'id', 'name', 'is_lock'),
      options?.user_count && {
        user_count: db.q.adminGroupUser
          .select(agu, { count: db.count().as('count') })
          .where(db.eq(agu.admin_group_id, ag.id))
          .as('user_count'),
      },
    ])
      .where(db.eq(ag, { is_lock: options?.is_lock }))
      .orderBy(db.asc(ag.is_lock), db.asc(ag.id));
  }
}

export const adminGroup = new AdminGroup();

export type AdminGroup$AddValues = ReturnType<typeof adminGroup.addValues>;
export type AdminGroup$EditValues = ReturnType<typeof adminGroup.editValues>;
