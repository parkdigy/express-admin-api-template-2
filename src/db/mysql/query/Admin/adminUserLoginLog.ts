import { MySqlQuery } from '../@common';
import type { AdminUserId } from '@const';

export const AdminUserLoginLogKeywordOption = ['all', 'email', 'ip', 'location'] as const;
export type AdminUserLoginLogKeywordOption = (typeof AdminUserLoginLogKeywordOption)[number];

class AdminUserLoginLog extends MySqlQuery<'adminUserLoginLog'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminUserLoginLog');
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list({
    admin_user_id,
    is_super_admin,
    login_date_from,
    login_date_to,
    keyword_option,
    keyword,
  }: {
    admin_user_id: AdminUserId;
    is_super_admin: boolean;
    login_date_from: Date;
    login_date_to: Date;
    keyword_option?: AdminUserLoginLogKeywordOption;
    keyword?: string;
  }) {
    const aull = db.a.adminUserLoginLog();
    const au = db.a.adminUser();

    return this.select(
      aull,
      db.columns(
        [aull, 'id', 'admin_user_id', 'ip_address', 'ip_country', 'ip_city', 'create_date'],
        [au, 'email', 'name']
      )
    )
      .innerJoin(au, db.eq(au.id, aull.admin_user_id))
      .where(
        db.and(
          db.gte(aull.create_date, util.dateTime.beginOfDay(login_date_from)),
          db.lte(aull.create_date, util.dateTime.endOfDay(login_date_to)),
          !is_super_admin ? db.eq(au.id, admin_user_id) : undefined,
          notEmpty(keyword)
            ? db.or(
                contains(['all', 'email'], keyword_option)
                  ? db.inArray(
                      aull.admin_user_id,
                      db.q.adminUser.select(['id']).where(db.like(db.s.adminUser.email, `%${keyword}%`))
                    )
                  : undefined,
                contains(['all', 'ip'], keyword_option) ? db.eq(aull.ip_address, keyword) : undefined,
                contains(['all', 'location'], keyword_option)
                  ? db.or(db.eq(aull.ip_country, keyword), db.eq(aull.ip_city, keyword))
                  : undefined
              )
            : undefined
        )
      )
      .orderBy(db.desc(aull.create_date));
  }
}

export const adminUserLoginLog = new AdminUserLoginLog();

export type TAdminUserLoginLog = typeof adminUserLoginLog.t.$inferSelect;

export type AdminUserLoginLog$AddValues = ReturnType<typeof adminUserLoginLog.addValues>;
export type AdminUserLoginLog$EditValues = ReturnType<typeof adminUserLoginLog.editValues>;
