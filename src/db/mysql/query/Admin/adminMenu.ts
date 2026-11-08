import { MySqlQuery } from '../@common';
import type { MySqlSelectedTableColumns, InferColumnsDataTypes } from '@pdg/drizzle-mysql';
import type { AdminGroupId, AdminMenuId } from '@const';

export type AdminMenuItem = InferColumnsDataTypes<MySqlSelectedTableColumns<typeof db.s.adminMenu>> &
  PartialPick<
    InferColumnsDataTypes<MySqlSelectedTableColumns<typeof db.s.adminGroupMenu>>,
    'read' | 'write' | 'export'
  > & {
    items?: AdminMenuItem[];
  };

/** 메뉴 목록을 메뉴 트리로 만들기 */
function makeMenus(list: AdminMenuItem[]) {
  const menus: AdminMenuItem[] = [];
  list.forEach((item) => {
    item.items = [];
    if (item.depth === 1) {
      menus.push(item);
    } else {
      menus.find((menu) => {
        if (menu.id === item.parent_id) {
          menu.items?.push(item);
          return true;
        }
      });
    }
  });
  return menus.filter((info) => !(empty(info.uri) && info.items?.length === 0));
}

class AdminMenu extends MySqlQuery<'adminMenu'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminMenu');
  }

  /********************************************************************************************************************
   * 목록
   ********************************************************************************************************************/
  list() {
    return this.select([
      'id',
      'name',
      'parent_id',
      'uri',
      'is_super_admin_menu',
      'is_all_user_menu',
      'icon',
      'depth',
    ]).orderBy(db.asc(this.t.depth), db.asc(this.t.seq));
  }

  /********************************************************************************************************************
   * 정보
   ********************************************************************************************************************/
  info(id: AdminMenuId) {
    return this.findByPrimaryKey(id);
  }

  /********************************************************************************************************************
   * 로그인 관리자 메뉴 목록
   ********************************************************************************************************************/
  async listOfSession({ is_super_admin, admin_group_id }: { is_super_admin: boolean; admin_group_id: AdminGroupId }) {
    const am = db.a.adminMenu();
    const agm = db.a.adminGroupMenu();

    const builder = (() => {
      if (is_super_admin) {
        return this.select(am, [
          db.columns(am),
          {
            read: db.sqlBoolean(true),
            write: db.sqlBoolean(true),
            export: db.sqlBoolean(true),
          },
        ]);
      } else {
        return this.select(am, db.columns([am], [agm, 'read', 'write', 'export']))
          .leftJoin(agm, db.eq(agm, { admin_menu_id: am.id, admin_group_id, read: true }))
          .where(db.eq(am, { is_super_admin_menu: false }));
      }
    })();

    const list = (await builder.orderBy(db.asc(am.depth), db.asc(am.seq))).filter(
      (info) => (info.depth === 1 && empty(info.uri)) || info.is_all_user_menu || info.read
    );

    return makeMenus(
      list.map((info) => ({
        ...info,
        read: !!info.read,
        write: !!info.write,
        export: !!info.export,
      }))
    );
  }

  /********************************************************************************************************************
   * 그룹 수정용 목록
   ********************************************************************************************************************/
  async listForGroupEdit(admin_group_id?: AdminGroupId) {
    const am = db.a.adminMenu();
    const agm = db.a.adminGroupMenu();

    const list = await (() => {
      if (admin_group_id === undefined) {
        return this.select(am, db.columns(am));
      } else {
        return this.select(am, db.columns([am], [agm, 'read', 'write', 'export'])).leftJoin(
          agm,
          db.eq(agm, { admin_menu_id: am.id, admin_group_id })
        );
      }
    })()
      .where(db.eq(am, { is_super_admin_menu: false, is_all_user_menu: false }))
      .orderBy(db.asc(am.depth), db.asc(am.seq));

    return makeMenus(list);
  }

  /********************************************************************************************************************
   * 다음 seq 얻기
   ********************************************************************************************************************/
  async getNextSeq(parent_id?: string) {
    const info = await this.find(
      { max_seq: db.max(this.t.seq) },
      parent_id ? this.eq({ parent_id }) : this.eq({ depth: 1 })
    );
    return (info?.max_seq || 0) + 10;
  }
}

export const adminMenu = new AdminMenu();

export type TAdminMenu = typeof adminMenu.t.$inferSelect;

export type AdminMenu$AddValues = ReturnType<typeof adminMenu.addValues>;
export type AdminMenu$EditValues = ReturnType<typeof adminMenu.editValues>;
