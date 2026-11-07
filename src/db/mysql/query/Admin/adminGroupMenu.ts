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
    for (const admin_menu_id of Object.keys(menus)) {
      const menuRoles = menus[admin_menu_id];

      const addValue = this.addValues({
        admin_group_id,
        admin_menu_id,
        read: false,
        write: false,
        export: false,
      });
      const editValue = this.editValues({});

      for (const role of Object.keys(menuRoles)) {
        if (!contains(['read', 'write', 'export'], role)) continue;

        addValue[role] = menuRoles[role].new;
        editValue[role] = menuRoles[role].new;
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
