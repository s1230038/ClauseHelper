import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findKanjiNumbers, kanji2number } from './JapaneseNumeral.ts'

describe('Function test: kanji2number()', () => {
  it('should convert kanji numerals into numbers', () => {
    const cases: [string, number][] = [
      ['一', 1],
      ['十', 10],
      ['十三', 13],
      ['十九', 19],
      ['二十', 20],
      ['三十三', 33],
      ['百', 100],
      ['百三', 103],
      ['百七十四', 174],
      ['二百六十四', 264],
      ['千', 1000],
      ['千百十一', 1111],
      ['九千九百九十九', 9999],
    ]
    for (const [kanji, expected] of cases) {
      assert.equal(kanji2number(kanji), expected, kanji)
    }
  })

  it('should throw on unsupported characters', () => {
    assert.throws(() => kanji2number('一万'))
  })
})

describe('Function test: findKanjiNumbers()', () => {
  it('should find kanji numerals in order', () => {
    assert.deepEqual(findKanjiNumbers('第十九条'), ['十九'])
    assert.deepEqual(findKanjiNumbers('条の三の三の二'), ['三', '三', '二'])
    assert.deepEqual(findKanjiNumbers('条文'), [])
  })
})
