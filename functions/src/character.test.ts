import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  parseCreateRequest, parseDuplicateRequest, parseUpdateRequest, toDuplicatedCharacter, toStoredCharacter,
} from './character.ts'

test('toStoredCharacter drops password fields and sets id and updateTime', () => {
  const out = toStoredCharacter(
    { pcName: 'A', id: 'other', updateTime: 'x', password: 'h', passwordConfirm: 'p', passwordForUpdate: 'q' },
    'doc1', new Date('2026-10-17T00:00:00.000Z'))
  assert.deepEqual(out, { pcName: 'A', id: 'doc1', updateTime: '2026-10-17T00:00:00.000Z' })
})
test('parseCreateRequest accepts an empty password', () => {
  assert.equal(parseCreateRequest({ character: {}, password: '' }).password, '')
})
test('parseCreateRequest rejects a non-string password', () => {
  for (const password of [undefined, 1, null]) {
    assert.throws(() => parseCreateRequest({ character: {}, password }), { code: 'invalid-argument' })
  }
})
test('parse rejects a non-object or array character', () => {
  for (const character of [null, 'x', [], undefined]) {
    assert.throws(() => parseCreateRequest({ character, password: '' }), { code: 'invalid-argument' })
  }
})
test('parse rejects a character of 1,000,000 bytes or more', () => {
  const character = { notes: 'あ'.repeat(340_000) } // UTF-8 で約 1,020,000 バイト
  assert.throws(() => parseCreateRequest({ character, password: '' }), { code: 'invalid-argument' })
})
test('parseUpdateRequest requires a non-empty string id', () => {
  for (const id of ['', undefined, 3]) {
    assert.throws(() => parseUpdateRequest({ id, character: {}, password: '' }), { code: 'invalid-argument' })
  }
})
test('parseDuplicateRequest requires a non-empty string id and a string password', () => {
  assert.deepEqual(parseDuplicateRequest({ id: 'a', password: '' }), { id: 'a', password: '' })
  for (const data of [null, { id: '', password: '' }, { id: 3, password: '' }, { id: 'a', password: 1 }]) {
    assert.throws(() => parseDuplicateRequest(data), { code: 'invalid-argument' })
  }
})
test('toDuplicatedCharacter prefixes the name and stores under the new id', () => {
  const out = toDuplicatedCharacter(
    { pcName: 'A', plName: 'P', id: 'src', updateTime: 'x', password: 'h' },
    'doc2', new Date('2026-10-18T00:00:00.000Z'))
  assert.deepEqual(out, { pcName: 'Copy of A', plName: 'P', id: 'doc2', updateTime: '2026-10-18T00:00:00.000Z' })
})
