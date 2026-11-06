import { v4 as uuid_v4 } from 'uuid';

export function uuid(removeDash = false) {
  const id = uuid_v4();
  return removeDash ? id.replace(/-/g, '') : id;
}

export default uuid;
