export interface AdminMenuListItem {
  id: string;
  name: string;
  depth: number;
  parent_id: string | null;
  uri: string | null;
  is_super_admin_menu: boolean;
  is_all_user_menu: boolean;
  icon: string | null;
  editable: boolean;
  items: AdminMenuListItem[];
}
