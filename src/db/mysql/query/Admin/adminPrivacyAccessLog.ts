import { MySqlQuery } from '../@common';
import { AdminPrivacyAccessLogType, type AdminUserId } from '@const';

class AdminPrivacyAccessLog extends MySqlQuery<'adminPrivacyAccessLog'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminPrivacyAccessLog');
  }

  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  list({
    search_date_from,
    search_date_to,
    type,
    admin_user_id,
  }: {
    search_date_from: Date;
    search_date_to: Date;
    type?: AdminPrivacyAccessLogType;
    admin_user_id?: AdminUserId;
  }) {
    const al = db.a.adminPrivacyAccessLog();
    const au = db.a.adminUser();

    return this.select(al, [
      db.columns(al, 'id', 'admin_user_id', 'type', 'reason', 'parent_id', 'create_date'),
      { admin_user_name: au.name },
    ])
      .innerJoin(au, db.eq(au.id, al.admin_user_id))
      .where(
        db.and(al, {
          gte: { create_date: search_date_from },
          lte: { create_date: search_date_to },
          eq: { type, admin_user_id },
        })
      )
      .orderBy(db.desc(al.create_date));
  }
}

export const adminPrivacyAccessLog = new AdminPrivacyAccessLog();
