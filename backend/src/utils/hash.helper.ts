const crypto = require('crypto');

export function hashString(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}
