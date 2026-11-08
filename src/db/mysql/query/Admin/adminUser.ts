import { MySqlQuery } from '../@common';
import type { AdminGroupId, AdminUserId } from '@const';

export const AdminUserListKeywordOption = ['id', 'email', 'name'] as const;
export type AdminUserListKeywordOption = (typeof AdminUserListKeywordOption)[number];

class AdminUser extends MySqlQuery<'adminUser'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminUser');
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list({
    keyword_option,
    keyword,
    is_lock,
    admin_group_id,
  }: {
    keyword_option?: AdminUserListKeywordOption;
    keyword?: string;
    is_lock?: boolean;
    admin_group_id?: AdminGroupId;
  }) {
    const au = db.a.adminUser();
    const agu = db.a.adminGroupUser();
    const ag = db.a.adminGroup();

    return this.select(au, [
      db.columns(
        au,
        'id',
        'email',
        'name',
        'tel',
        'is_lock',
        'login_fail_count',
        'must_password_change',
        'create_date'
      ),
      db.columns(agu, 'admin_group_id'),
      db.columns(ag, 'name as admin_group_name'),
    ])
      .leftJoin(agu, db.eq(agu.admin_user_id, au.id))
      .leftJoin(ag, db.eq(ag.id, agu.admin_group_id))
      .where(
        db.and(
          db.gt(au, { id: 100 }),
          db.eq(au, { is_lock }),
          db.eq(agu, { admin_group_id }),
          notEmpty(keyword)
            ? keyword_option === 'id'
              ? db.eq(au, { id: Number(keyword) })
              : keyword_option === 'email'
                ? db.like(au, { email: `%${keyword}%` })
                : keyword_option === 'name'
                  ? db.like(au, { name: `%${keyword}%` })
                  : undefined
            : undefined
        )
      )
      .orderBy(db.asc(au.is_lock), db.desc(au.id));
  }

  /********************************************************************************************************************
   * 전체 목록
   ********************************************************************************************************************/
  allList(options?: { is_lock?: boolean }) {
    const au = db.a.adminUser();
    const agu = db.a.adminGroupUser();
    const ag = db.a.adminGroup();

    return this.select(au, [db.columns([au, 'id', 'name', 'email'], [agu, 'admin_group_id']), { group_name: ag.name }])
      .leftJoin(agu, db.eq(agu.admin_user_id, au.id))
      .leftJoin(ag, db.eq(ag.id, agu.admin_group_id))
      .where(db.and(au, { gt: { id: 100 }, eq: { is_lock: options?.is_lock } }))
      .orderBy(db.asc(au.email));
  }

  /********************************************************************************************************************
   * 정보
   ********************************************************************************************************************/
  async info(id: AdminUserId) {
    const au = db.a.adminUser();
    const agu = db.a.adminGroupUser();
    const ag = db.a.adminGroup();

    const [info] = await this.select(au, [
      db.columns(
        [au, 'id', 'name', 'email', 'tel', 'must_password_change', 'is_lock', 'create_date'],
        [agu, 'admin_group_id']
      ),
      { admin_group_name: db.sql`${ag.name}`.as('admin_group_name') },
    ])
      .leftJoin(agu, db.eq(agu.admin_user_id, au.id))
      .leftJoin(ag, db.eq(ag.id, agu.admin_group_id))
      .where(db.eq(au, { id }))
      .limit(1);

    return info;
  }

  /********************************************************************************************************************
   * 이메일 존재 여부
   * ******************************************************************************************************************/
  existsEmail(email: string, options?: { exceptId?: AdminUserId }) {
    return this.exists(this.and({ eq: { email }, ne: { id: options?.exceptId } }));
  }

  /********************************************************************************************************************
   * 로그인 처리를 위한 정보
   ********************************************************************************************************************/
  infoForSignIn(email: string) {
    return this.find(['id', 'email', 'password', 'is_lock', 'login_fail_count', 'must_password_change'], (q) =>
      q.eq({ email })
    );
  }

  /********************************************************************************************************************
   * 로그인 정보
   ********************************************************************************************************************/
  async infoForSession(id: AdminUserId) {
    const au = db.a.adminUser();
    const agu = db.a.adminGroupUser();
    const ag = db.a.adminGroup();

    const [info] = await this.select(au, [
      db.columns(au, 'id', 'email', 'must_password_change'),
      {
        admin_group_id: db.sqlNumber(db.sql`coalesce(${agu.admin_group_id}, 0)`),
        is_super_admin: db.sqlBoolean(db.sql`coalesce(${agu.admin_group_id} = 1, false)`),
        is_privacy_access: db.sqlBoolean(db.sql`
        case
          when ${agu.admin_group_id} = 1 then true
          else coalesce(${ag.is_privacy_access}, false)
        end
      `),
      },
    ])
      .leftJoin(agu, db.eq(agu.admin_user_id, au.id))
      .leftJoin(ag, db.eq(ag.id, agu.admin_group_id))
      .where(db.eq(au, { id }))
      .limit(1);

    return info;
  }

  /********************************************************************************************************************
   * 비밀번호 변경
   ********************************************************************************************************************/
  passwordChange(
    id: AdminUserId,
    { password, must_password_change }: { password: string; must_password_change: boolean }
  ) {
    return this.editByPrimaryKey({ password, must_password_change }, id);
  }

  /********************************************************************************************************************
   * 사용 잠금
   ********************************************************************************************************************/
  lock(id: AdminUserId) {
    return this.editByPrimaryKey({ is_lock: true }, id);
  }

  /********************************************************************************************************************
   * 사용 잠금 해제
   ********************************************************************************************************************/
  unlock(id: AdminUserId) {
    return this.editByPrimaryKey({ is_lock: false, login_fail_count: 0 }, id);
  }
}

export const adminUser = new AdminUser();

export type AdminUser$AddValues = ReturnType<typeof adminUser.addValues>;
export type AdminUser$EditValues = ReturnType<typeof adminUser.editValues>;
