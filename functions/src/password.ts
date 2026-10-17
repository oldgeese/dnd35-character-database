import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

export type ScryptParams = { N: number; r: number; p: number; keylen: number }
export type PasswordHash = { salt: string; hash: string; scryptParams: ScryptParams }

export const SCRYPT_PARAMS: ScryptParams = { N: 32768, r: 8, p: 1, keylen: 32 }

const SALT_BYTES = 16
const MAX_MEM = 64 * 1024 * 1024

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function deriveKey(input: string, salt: Buffer, params: ScryptParams): Promise<Buffer> {
  const { N, r, p, keylen } = params
  return new Promise((resolve, reject) => {
    scrypt(input, salt, keylen, { N, r, p, maxmem: MAX_MEM }, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

export async function hashSha256Hex(sha256HexValue: string): Promise<PasswordHash> {
  const salt = randomBytes(SALT_BYTES)
  const key = await deriveKey(sha256HexValue, salt, SCRYPT_PARAMS)
  return {
    salt: salt.toString('base64'),
    hash: key.toString('base64'),
    scryptParams: { ...SCRYPT_PARAMS },
  }
}

export function hashPassword(password: string): Promise<PasswordHash> {
  return hashSha256Hex(sha256Hex(password))
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const expected = Buffer.from(stored.hash, 'base64')
  const actual = await deriveKey(
    sha256Hex(password),
    Buffer.from(stored.salt, 'base64'),
    stored.scryptParams,
  )
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
