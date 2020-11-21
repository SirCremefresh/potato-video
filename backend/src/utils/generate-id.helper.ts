import {v4 as uuidV4} from 'uuid';

export function generateId(): string {
  return uuidV4();
}
