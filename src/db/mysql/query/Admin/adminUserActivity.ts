import { MySqlQuery } from '../@common';
import type { AdminUserActivityTypeId } from '@const';

class AdminUserActivity extends MySqlQuery<'adminUserActivity'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminUserActivity');
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list({ user_activity_type_id, parent_id }: { user_activity_type_id: AdminUserActivityTypeId; parent_id: number }) {
    const aua = db.a.adminUserActivity();
    const au = db.a.adminUser();
    const pag = db.a.adminGroup('pag');
    const pau = db.a.adminUser('pau');

    const builder = this.select(aua, [
      db.columns(
        [
          aua,
          'id',
          'admin_user_activity_type_id',
          'parent_id',
          'admin_user_id',
          'activity_text_1',
          'activity_text_2',
          'memo',
          'create_date',
          'update_date',
        ],
        [au, 'email', 'name']
      ),
      {
        parent_name:
          user_activity_type_id === 100 ? pag.name : user_activity_type_id === 101 ? pau.name : db.sqlString(''),
      },
    ])
      .innerJoin(au, db.eq(au.id, aua.admin_user_id))
      .where(
        db.eq(aua, {
          admin_user_activity_type_id: user_activity_type_id,
          parent_id: parent_id ? `${parent_id}` : undefined,
        })
      )
      .orderBy(db.desc(aua.id))
      .$dynamic();

    switch (user_activity_type_id) {
      case 100:
        builder.innerJoin(pag, db.eq(pag.id, aua.parent_id));
        break;
      case 101:
        builder.innerJoin(pau, db.eq(pau.id, aua.parent_id));
        break;
    }

    return builder;
  }
}

export const adminUserActivity = new AdminUserActivity();
