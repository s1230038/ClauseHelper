// 漢数字（一〜九、十・百・千）と算用数字の変換。条文の条・項・枝番号の範囲（万未満）のみ扱う

const DIGITS: { [kanji: string]: number } = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
}
const UNITS: { [kanji: string]: number } = { 十: 10, 百: 100, 千: 1000 }

export const KANJI_NUMBER_CHARS = '一二三四五六七八九十百千'

/**
 * 漢数字を数値に変換（例: 二百六十四 → 264、十三 → 13）
 * @param kanji kanji numeral
 * @returns number
 */
export function kanji2number(kanji: string): number {
  let total = 0
  let digit = 0
  for (const char of kanji) {
    if (char in DIGITS) {
      digit = DIGITS[char]
    } else if (char in UNITS) {
      // 「十」「百」「千」の前に数字がなければ 1 とみなす
      total += (digit === 0 ? 1 : digit) * UNITS[char]
      digit = 0
    } else {
      throw new Error(`Unsupported kanji numeral: ${kanji}`)
    }
  }
  return total + digit
}

/**
 * テキスト中の漢数字の並びを出現順に返す
 * @param text
 * @returns kanji numeral list
 */
export function findKanjiNumbers(text: string): string[] {
  return text.match(new RegExp(`[${KANJI_NUMBER_CHARS}]+`, 'g')) ?? []
}
