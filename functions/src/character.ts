import { HttpsError } from 'firebase-functions/https'

export type CharacterData = Record<string, unknown>

const MAX_CHARACTER_BYTES = 1_000_000
const PASSWORD_FIELDS = ['password', 'passwordConfirm', 'passwordForUpdate']

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseBase = (data: unknown): { character: CharacterData; password: string } => {
  if (!isPlainObject(data)) throw new HttpsError('invalid-argument', 'Invalid request')
  const { character, password } = data
  if (!isPlainObject(character)) throw new HttpsError('invalid-argument', 'character must be an object')
  if (typeof password !== 'string') throw new HttpsError('invalid-argument', 'password must be a string')
  if (Buffer.byteLength(JSON.stringify(character)) >= MAX_CHARACTER_BYTES) {
    throw new HttpsError('invalid-argument', 'character is too large')
  }
  return { character, password }
}

export const parseCreateRequest = (data: unknown): { character: CharacterData; password: string } =>
  parseBase(data)

export const parseUpdateRequest = (data: unknown): { id: string; character: CharacterData; password: string } => {
  const base = parseBase(data)
  const id = (data as Record<string, unknown>).id
  if (typeof id !== 'string' || id === '') throw new HttpsError('invalid-argument', 'id must be a non-empty string')
  return { id, ...base }
}

export const parseDuplicateRequest = (data: unknown): { id: string; password: string } => {
  if (!isPlainObject(data)) throw new HttpsError('invalid-argument', 'Invalid request')
  const { id, password } = data
  if (typeof id !== 'string' || id === '') throw new HttpsError('invalid-argument', 'id must be a non-empty string')
  if (typeof password !== 'string') throw new HttpsError('invalid-argument', 'password must be a string')
  return { id, password }
}

export const toStoredCharacter = (character: CharacterData, id: string, now: Date): CharacterData => {
  const stored: CharacterData = { ...character }
  for (const field of PASSWORD_FIELDS) delete stored[field]
  stored.id = id
  stored.updateTime = now.toISOString()
  return stored
}

export const toDuplicatedCharacter = (source: CharacterData, id: string, now: Date): CharacterData =>
  toStoredCharacter({ ...source, pcName: `Copy of ${source.pcName ?? ''}` }, id, now)
