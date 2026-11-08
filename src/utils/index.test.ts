import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Character } from '../models'
import { matchesCharacterSearch } from './index.ts'

// Only the searched fields matter; the cast keeps fixtures short.
const char = (fields: Record<string, unknown>) => fields as unknown as Character

const matches = (fields: Record<string, unknown>, query: string) => matchesCharacterSearch(char(fields), query)

test('empty or separator-only query matches everything', () => {
  assert.equal(matches({ pcName: 'エルフ' }, ''), true)
  assert.equal(matches({ pcName: 'エルフ' }, ' 　・/='), true)
  assert.equal(matches({}, ''), true)
})

test('searches pcName, plName and classLevel', () => {
  const c = { pcName: 'アリス', plName: 'たろう', classLevel: 'ファイター5', race: 'エルフ' }
  assert.equal(matches(c, 'アリス'), true)
  assert.equal(matches(c, 'たろう'), true)
  assert.equal(matches(c, 'ファイター'), true)
  assert.equal(matches(c, 'エルフ'), false)
})

test('matches substrings', () => {
  assert.equal(matches({ pcName: 'グレゴリー' }, 'ゴリ'), true)
  assert.equal(matches({ pcName: 'グレゴリー' }, 'ゴリラ'), false)
})

test('folds full-width and half-width characters (NFKC)', () => {
  assert.equal(matches({ pcName: 'カタカナ' }, 'ｶﾀｶﾅ'), true)
  assert.equal(matches({ pcName: 'ｶﾀｶﾅ' }, 'カタカナ'), true)
  assert.equal(matches({ pcName: 'ガンダルフ' }, 'ｶﾞﾝﾀﾞﾙﾌ'), true)
  assert.equal(matches({ classLevel: 'Fighter５' }, 'fighter5'), true)
})

test('ignores letter case', () => {
  assert.equal(matches({ pcName: 'ABC' }, 'ａｂｃ'), true)
  assert.equal(matches({ pcName: 'abc' }, 'ABC'), true)
})

test('keeps hiragana and katakana distinct (#508)', () => {
  assert.equal(matches({ pcName: 'カタカナ' }, 'かたかな'), false)
  assert.equal(matches({ pcName: 'ひらがな' }, 'ヒラガナ'), false)
})

test('ignores whitespace, ・, = and / in both query and field', () => {
  assert.equal(matches({ pcName: 'ジョン・スミス' }, 'ジョンスミス'), true)
  assert.equal(matches({ pcName: 'ジョンスミス' }, 'ジョン・スミス'), true)
  assert.equal(matches({ pcName: 'ジョン･スミス' }, 'ジョン・スミス'), true)
  assert.equal(matches({ pcName: 'アン=マリー' }, 'アン マリー'), true)
  assert.equal(matches({ classLevel: 'ファイター/ウィザード' }, 'ファイターウィザード'), true)
  assert.equal(matches({ pcName: 'ジョン　スミス' }, 'ジョン スミス'), true)
})

test('numeric fields are searchable', () => {
  assert.equal(matches({ classLevel: 5 }, '5'), true)
})

test('non-string, non-number fields never match', () => {
  assert.equal(matches({ pcName: { name: 'x' } }, 'object'), false)
  assert.equal(matches({ pcName: null, plName: undefined, classLevel: ['ファイター'] }, 'ファイター'), false)
  assert.equal(matches({ pcName: null }, 'null'), false)
  assert.equal(matches({}, 'undefined'), false)
})
