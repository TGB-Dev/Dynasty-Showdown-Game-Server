import argon2 from 'argon2';

// See https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
export const argon2Options: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024, // 19 MiB -> KiB
  timeCost: 2,
  parallelism: 1,
};
