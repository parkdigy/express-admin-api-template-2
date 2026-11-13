import { MySqlQuery } from '../@common';
import type { AdminGroupId } from '@const';

interface MenuItem {
  [key: string]: { new: boolean };
}
type Menus = { [key: string]: MenuItem };

class AdminGroupMenu extends MySqlQuery<'adminGroupMenu'> {
  /********************************************************************************************************************
   * constructor
   * ******************************************************************************************************************/
  constructor() {
    super('adminGroupMenu');
  }

  /********************************************************************************************************************
   * 메뉴 권한 등록/수정
   ********************************************************************************************************************/
  async addOrEditMenus({ admin_group_id, menus }: { admin_group_id: AdminGroupId; menus: Menus }) {
    for (const [admin_menu_id, menuRoles] of Object.entries(menus)) {
      const addValue = this.addValues({
        admin_group_id,
        admin_menu_id,
        read: false,
        write: false,
        export: false,
      });
      const editValue = this.editValues({});

      for (const [role, menuRole] of Object.entries(menuRoles)) {
        if (!contains(['read', 'write', 'export'], role)) continue;

        addValue[role] = menuRole.new;
        editValue[role] = menuRole.new;
      }

      const where = this.eq({ admin_group_id, admin_menu_id });

      if (await this.exists(where)) {
        await this.edit(editValue, where);
      } else {
        await this.add(addValue);
      }
    }
  }
}

export const adminGroupMenu = new AdminGroupMenu();

export type TAdminGroupMenu = typeof adminGroupMenu.t.$inferSelect;

export type AdminGroupMenu$AddValues = ReturnType<typeof adminGroupMenu.addValues>;
export type AdminGroupMenu$EditValues = ReturnType<typeof adminGroupMenu.editValues>;
