import assert from 'node:assert/strict'
import { test } from 'node:test'
import { hashPassword, hashSha256Hex, sha256Hex, verifyPassword } from './password.ts'

test('SHA-256 of a known password', () => {
  assert.equal(sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
})
test('a wrapped legacy SHA-256 verifies with the original password', async () => {
  const stored = await hashSha256Hex(sha256Hex('secret'))
  assert.equal(await verifyPassword('secret', stored), true)
  assert.equal(await verifyPassword('Secret', stored), false)
})
test('empty password is a valid password', async () => {
  const stored = await hashPassword('')
  assert.equal(await verifyPassword('', stored), true)
  assert.equal(await verifyPassword(' ', stored), false)
})
test('non-ASCII password round-trips', async () => {
  assert.equal(await verifyPassword('パスワード🐉', await hashPassword('パスワード🐉')), true)
})
test('salt is random and params are stored', async () => {
  const a = await hashPassword('x'); const b = await hashPassword('x')
  assert.notEqual(a.salt, b.salt)
  assert.deepEqual(a.scryptParams, { N: 32768, r: 8, p: 1, keylen: 32 })
  assert.equal(Buffer.from(a.salt, 'base64').length, 16)
  assert.equal(Buffer.from(a.hash, 'base64').length, 32)
})
