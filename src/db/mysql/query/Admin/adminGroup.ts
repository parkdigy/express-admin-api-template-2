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

    return this.select(ag, [
      db.columns(ag, 'id', 'name', 'is_lock'),
      options?.user_count && {
        user_count: db.q.adminGroupUser
          .select({
            count: db.count(),
          })
          .where((q) =>
            q.eq({
              admin_group_id: ag.id,
            })
          ),
      },
    ])
      .where(db.eq(ag.is_lock, options?.is_lock))
      .orderBy(db.asc(ag.is_lock), db.asc(ag.id));
  }
}

export const adminGroup = new AdminGroup();

export type TAdminGroup = typeof adminGroup.t.$inferSelect;

export type TAdminGroup$AddData = ReturnType<typeof adminGroup.addData>;
export type TAdminGroup$EditData = ReturnType<typeof adminGroup.editData>;
