import { MySqlQuery } from '../@common';
import type { AdminUserAccessKeyType } from '@const';

export const AdminUserAccessLogKeywordOption = ['user_id', 'email'] as const;
export type AdminUserAccessLogKeywordOption = (typeof AdminUserAccessLogKeywordOption)[number];

class AdminUserAccessLog extends MySqlQuery<'adminUserAccessLog'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminUserAccessLog');
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list({
    search_date_from,
    search_date_to,
    keyword_option,
    keyword,
    type,
  }: {
    search_date_from: Date;
    search_date_to: Date;
    keyword_option?: AdminUserAccessLogKeywordOption;
    keyword?: string;
    type?: AdminUserAccessKeyType;
  }) {
    const l = db.a.adminUserAccessLog();
    const u = db.a.adminUser();
    const k = db.a.adminUserAccessKey();

    return this.select(
      l,
      db.columns(
        [l, 'id', 'admin_user_id', 'admin_user_access_key_id', 'url', 'create_date'],
        [u, 'email'],
        [k, 'type', 'title']
      )
    )
      .innerJoin(u, db.eq(u.id, l.admin_user_id))
      .innerJoin(k, db.eq(k.id, l.admin_user_access_key_id))
      .where(
        db.and(
          db.gte(l.create_date, util.dateTime.beginOfDay(search_date_from)),
          db.lte(l.create_date, util.dateTime.endOfDay(search_date_to)),
          db.eq(k, { type }),
          notEmpty(keyword)
            ? keyword_option === 'user_id'
              ? db.eq(u.id, Number(keyword))
              : keyword_option === 'email'
                ? db.inArray(
                    l.admin_user_id,
                    db.q.adminUser.select(['id']).where(db.like(db.s.adminUser.email, `%${keyword}%`))
                  )
                : undefined
            : undefined
        )
      )
      .orderBy(db.desc(l.create_date));
  }
}

export const adminUserAccessLog = new AdminUserAccessLog();

export type AdminUserAccessLog$AddValues = ReturnType<typeof adminUserAccessLog.addValues>;
export type AdminUserAccessLog$EditValues = ReturnType<typeof adminUserAccessLog.editValues>;
