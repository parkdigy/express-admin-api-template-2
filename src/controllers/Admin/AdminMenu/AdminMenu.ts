/********************************************************************************************************************
 * 어드민 메뉴 Controller
 * ******************************************************************************************************************/

import { type AdminMenuListItem } from './AdminMenu.types';
import { Param_Boolean_Required, Param_String, Param_String_Required } from '@common_param';
import { AdminUserAccessKeyType } from '@const';

// 다음 메뉴들은 수정/삭제할 수 없음
// '어드민 관리', '어드민 관리 > 메뉴 관리', '어드민 관리 > 사용자 관리', '어드민 관리 > 그룹 관리'
// '어드민 관리 > 로그인 로그', '어드민 관리 > 비밀번호 수정', '어드민 관리 > 접속 통계', '어드민 관리 > 개인정보 조회 로그'
const NOT_EDITABLE_MENU_IDS = [
  'admin',
  'admin/menu',
  'admin/user',
  'admin/group',
  'admin/login_log',
  'admin/password',
  'admin/access_log',
  'admin/privacy_access_log',
];

export default {
  /********************************************************************************************************************
   * 목록
   * ******************************************************************************************************************/
  async list(req: MyAuthRequest, res: MyResponse) {
    // 메뉴 목록
    const list = await db.q.adminMenu.list();

    const data: AdminMenuListItem[] = [];
    // 부모 메뉴를 찾기 위한 객체
    const dataKeys: Dict<AdminMenuListItem> = {};

    for (const info of list) {
      if (info.id === 'admin/menu') continue; // '어드민 관리 > 메뉴 관리' 메뉴는 제외

      // items 추가
      const dataItem: AdminMenuListItem = {
        ...info,
        editable: !contains(NOT_EDITABLE_MENU_IDS, info.id),
        items: [],
      };

      if (info.depth === 1) {
        // 1차 메뉴
        data.push(dataItem);
        dataKeys[info.id] = dataItem;
      } else if (info.parent_id) {
        // 2차 이상 메뉴
        const parentDataItem = dataKeys[info.parent_id];
        if (parentDataItem) {
          // 부모 메뉴가 있으면, 부모 메뉴의 items 에 추가
          parentDataItem.items.push(dataItem);
          dataKeys[info.id] = dataItem;
        }
      }
    }

    api.success(res, data);
  },

  /********************************************************************************************************************
   * 정보
   * ******************************************************************************************************************/
  async info(req: MyAuthRequest, res: MyResponse) {
    const params = param(req, { id: Param_String_Required() });

    const id = replaceId(params.id); // id 치환

    // 메뉴 정보
    const info = await db.q.adminMenu.info(id);
    if (!info) throw paramError();

    if (info.parent_id) {
      // 부모 메뉴 정보
      const parentInfo = await db.q.adminMenu.info(info.parent_id);

      api.success(res, { ...info, parent: parentInfo });
    } else {
      api.success(res, info);
    }
  },

  /********************************************************************************************************************
   * 등록
   * ******************************************************************************************************************/
  async add(req: MyAuthRequest, res: MyResponse) {
    const {
      parent_id,
      id: paramId,
      name,
      icon,
    } = param(req, {
      parent_id: Param_String(),
      id: Param_String_Required(),
      name: Param_String_Required(),
      icon: Param_String(),
    });

    const id = parent_id ? `${parent_id}/${paramId.toLowerCase()}` : paramId.toLowerCase();

    // id 중복 검사
    if (await db.q.adminMenu.existsByPrimaryKey(id)) {
      throw api.newExceptionError('이미 등록된 ID 입니다.');
    }

    let depth = 1;
    let parentName: string | undefined = undefined;

    if (parent_id) {
      // 서브 메뉴이면 부모 메뉴 정보를 가져옴
      const parentInfo = await db.q.adminMenu.findByPrimaryKey(['name', 'depth'], parent_id);
      if (!parentInfo) throw paramError('parent_id');
      if (parentInfo.depth > 1) throw api.newExceptionError('하위 메뉴를 등록할 수 없습니다.');
      parentName = parentInfo.name;
      depth = parentInfo.depth + 1;
    } else {
      if (empty(icon)) throw paramError('icon');
    }

    const seq = await db.q.adminMenu.getNextSeq(parent_id);

    // Begin Transaction
    await db.trans(async () => {
      // 메뉴 등록
      await db.q.adminMenu.add({
        id,
        name,
        depth,
        parent_id,
        is_super_admin_menu: false,
        is_all_user_menu: false,
        seq,
        icon,
        uri: `/${id}`,
      });

      // 사용자 접근키 등록
      await db.q.adminUserAccessKey.addEdit({
        id,
        type: AdminUserAccessKeyType.View,
        title: parent_id ? `${parentName} > ${name}` : name,
      });

      if (parent_id) {
        await db.q.adminMenu.editByPrimaryKey({ uri: null }, parent_id);
      }
    });

    api.successMsg(res, '등록되었습니다.');
  },

  /********************************************************************************************************************
   * 수정
   * ******************************************************************************************************************/
  async edit(req: MyAuthRequest, res: MyResponse) {
    const {
      id: paramId,
      new_id: paramNewId,
      name,
      icon,
    } = param(req, {
      id: Param_String_Required(),
      new_id: Param_String_Required(),
      name: Param_String_Required(),
      icon: Param_String(),
    });

    const id = replaceId(paramId); // id 치환

    if (contains(NOT_EDITABLE_MENU_IDS, id)) {
      throw api.newExceptionError('수정할 수 없는 메뉴입니다.');
    }

    // 메뉴 정보
    const info = await db.q.adminMenu.findByPrimaryKey(['depth', 'parent_id'], id);
    if (!info) throw paramError('id');

    const newId = info.parent_id ? `${info.parent_id}/${paramNewId.toLowerCase()}` : paramNewId.toLowerCase();

    if (id !== newId) {
      // id 가 다를 경우, 중복 검사
      if (
        await db.q.adminMenu.exists((q) =>
          q.and({
            eq: { id: newId },
            ne: { id },
          })
        )
      ) {
        throw api.newExceptionError('이미 등록된 ID 입니다.');
      }
    }

    if (info.depth === 1) {
      // 1차 메뉴에는 아이콘 필수
      if (empty(icon)) throw paramError('icon');
    }

    let parentName: string | undefined = undefined;

    if (info.parent_id) {
      // 부모 메뉴 정보
      const parentInfo = await db.q.adminMenu.findByPrimaryKey(['name'], info.parent_id);
      parentName = parentInfo?.name;
    }

    const childMenuExists = await db.q.adminMenu.exists((q) => q.eq({ parent_id: id }));

    // Begin Transaction
    await db.trans(async () => {
      // 메뉴 수정
      await db.q.adminMenu.editByPrimaryKey({ id: newId, name, icon, uri: childMenuExists ? null : `/${newId}` }, id);

      // 사용자 접근키 등록/수정
      await db.q.adminUserAccessKey.addEdit({
        id: newId,
        type: AdminUserAccessKeyType.View,
        title: info.parent_id ? `${parentName} > ${name}` : name,
      });
    });

    api.success(res, '수정되었습니다.');
  },

  /********************************************************************************************************************
   * SUPER 권한 수정
   * ******************************************************************************************************************/
  async editSuper(req: MyAuthRequest, res: MyResponse) {
    const { id: paramId, is_super_admin_menu } = param(req, {
      id: Param_String_Required(),
      is_super_admin_menu: Param_Boolean_Required(),
    });

    const id = replaceId(paramId); // id 치환

    // 메뉴 정보
    const info = await db.q.adminMenu.findByPrimaryKey(['is_super_admin_menu'], id);
    if (!info) throw paramError();

    if (info.is_super_admin_menu !== is_super_admin_menu) {
      // 기존 SUPER 권한과 다를 경우에만 수정
      const editData = db.q.adminMenu.updateValues({ is_super_admin_menu });
      if (is_super_admin_menu) {
        editData.is_all_user_menu = false;
      }
      await db.q.adminMenu.editByPrimaryKey(editData, id);
    }

    api.successMsg(res, '수정되었습니다.');
  },

  /********************************************************************************************************************
   * ALL 권한 수정
   * ******************************************************************************************************************/
  async editAll(req: MyAuthRequest, res: MyResponse) {
    const { id: paramId, is_all_user_menu } = param(req, {
      id: Param_String_Required(),
      is_all_user_menu: Param_Boolean_Required(),
    });

    const id = paramId.replace(/_____/g, '/');

    // 메뉴 정보
    const info = await db.q.adminMenu.findByPrimaryKey(['is_all_user_menu'], id);
    if (!info) throw paramError();

    if (info.is_all_user_menu !== is_all_user_menu) {
      // 기존 ALL 권한과 다를 경우에만 수정
      const editData = db.q.adminMenu.updateValues({ is_all_user_menu });
      if (is_all_user_menu) {
        editData.is_super_admin_menu = false;
      }
      await db.q.adminMenu.editByPrimaryKey(editData, id);
    }

    api.successMsg(res, '수정되었습니다.');
  },

  /********************************************************************************************************************
   * 노출순서 수정
   * ******************************************************************************************************************/
  async editSeq(req: MyAuthRequest, res: MyResponse) {
    // JSON.stringify() 로 인코딩 된 data 파라미터 전달
    // Data 구조 : { id: string: seq: number }[]
    const { data: paramData } = param(req, { data: Param_String_Required() });

    const data = JSON.parse(paramData);

    // data 파라미터가 배열이 아니면 에러
    if (!Array.isArray(data)) throw paramError('data');

    // Begin Transaction
    await db.trans(async () => {
      for (const info of data) {
        // 객체가 아니면 에러
        if (typeof info !== 'object') throw paramError('data');

        // id, seq 정보가 없으면 에러
        if (info.id == null || info.seq == null) throw paramError('data');

        // seq 수정
        await db.q.adminMenu.editByPrimaryKey({ seq: info.seq }, info.id);
      }
    });

    api.successMsg(res, '메뉴 순서가 저장되었습니다.');
  },

  /********************************************************************************************************************
   * 삭제
   * ******************************************************************************************************************/
  async remove(req: MyAuthRequest, res: MyResponse) {
    const { id: paramId } = param(req, {
      id: Param_String_Required(),
    });

    const id = replaceId(paramId); // id 치환

    if (contains(NOT_EDITABLE_MENU_IDS, id)) {
      throw api.newExceptionError('삭제할 수 없는 메뉴입니다.');
    }

    // 서브 메뉴가 있는지 검사
    if (await db.q.adminMenu.exists((q) => q.eq({ parent_id: id }))) {
      throw api.newExceptionError('하위 메뉴가 있으면 삭제할 수 없습니다.');
    }

    const info = await db.q.adminMenu.findByPrimaryKey(['parent_id', 'depth'], id);
    if (info) {
      await db.q.adminMenu.removeByPrimaryKey(id);

      if (info.parent_id) {
        if (await db.q.adminMenu.notExists((q) => q.eq({ parent_id: info.parent_id }))) {
          await db.q.adminMenu.editByPrimaryKey({ uri: `/${info.parent_id}` }, info.parent_id);
        }
      }
    }

    api.successMsg(res, '삭제되었습니다.');
  },
};

/********************************************************************************************************************
 * id 변환 함수
 * - get 요청 시 '/' 문자를 '____' 로 치환해서 전달되므로 다시 '/' 문자로 치환
 * ******************************************************************************************************************/
function replaceId(id: string) {
  return id.replace(/_____/g, '/');
}
