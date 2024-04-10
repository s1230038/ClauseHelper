import { ParenthesisCorrespondence, LeftParenthesis } from '../components/Types'
import { replaceKanjiClause2Num } from './Kanji2Num'

/**
 * 丸括弧の縮小・展開したテキストを返す
 * @param originalText original Text
 * @param convertedText converted Text: 漢数字の算用数字への変換後の条文
 * @param changeLevel change level : current level と max level (最深ネスト)から目的のレベルを返すラムダ式
 * @returns
 */
export function collapseAndExpand(
  originalText: string,
  convertedText: string,
  changeLevel: (curLv: number, maxLv: number) => number,
): string {
  const origNumClause: string = replaceKanjiClause2Num(originalText)
  const origPcList: ParenthesisCorrespondence[] = getParenthesisCorrespondence(origNumClause)
  const curPcList: ParenthesisCorrespondence[] = getParenthesisCorrespondence(convertedText)
  const curLv = getCurrentLevel(curPcList)
  const maxLv = getMaxLevel(origPcList)
  const changeInto = changeLevel(curLv, maxLv)
  const collapsedText = collapse(origNumClause, changeInto, origPcList)
  return collapsedText
}

/**
 * 丸括弧リストを返す
 * @param text
 * @returns parenthesis correspondence list
 */
export function getParenthesisCorrespondence(text: string): ParenthesisCorrespondence[] {
  const lpStack: LeftParenthesis[] = [] // Left Parentheses stack
  const pcList: ParenthesisCorrespondence[] = []
  let level: number = 0
  for (let i = 0; i < text.length; i++) {
    const char: string = text.charAt(i)
    if (char === '（' && text.charAt(i + 1) !== '」') {
      lpStack.push({ level: level, beginning: i })
      level++
    } else if (char === '）') {
      if (lpStack.length === 0) {
        // 対応する開き括弧がない場合は不正
        const message = 'The correspondence between parentheses is invalid.'
        throw new Error(message)
      }
      const lp: LeftParenthesis | undefined = lpStack.pop()
      level--
      if (typeof lp === 'object' && lp != null) {
        const pc: ParenthesisCorrespondence = {
          level: lp.level,
          beginning: lp.beginning,
          end: i,
          nextToBeginning: text.charAt(lp.beginning + 1),
          debugEnd: text.charAt(i + 1),
        }
        pcList.push(pc)
      } else {
        throw new Error('lpStack element is invalid.')
      }
    }
  }
  // 置換対象文字長の降順でソート。短い置換対象文字列で長い置換対象文字列を意図せず置換しないため
  pcList.sort((a, b) => b.end - b.beginning - (a.end - a.beginning))
  return pcList
}
/**
 * 指定したtargetLevelのネストまで丸括弧を短縮表示する
 * @param origText original text
 * @param targetLevel target level: 最も外側の丸括弧のlevel = 0
 * @param pcList parenthesis correspondence list
 * @returns
 */
export function collapse(
  origText: string,
  targetLevel: number,
  pcList: ParenthesisCorrespondence[],
): string {
  const targetPcList = pcList.filter(({ level }) => level === targetLevel)
  if (targetLevel === undefined) {
    return origText
  }
  let collapsedText = origText
  for (const pc of targetPcList) {
    // Parenthesis block
    const pBlock = origText.slice(pc.beginning, pc.end + 1)
    collapsedText = collapsedText.replaceAll(pBlock, '（…）')
  }
  return collapsedText
}

/**
 * 短縮表示されている丸括弧のレベル（深さ、ネスト）を返す
 * @param CurPcList current parenthesis correspondence list
 * @returns current level: -1 means no collapsing parenthesis
 */
export function getCurrentLevel(CurPcList: ParenthesisCorrespondence[]): number {
  let curLv = -1
  for (const pc of CurPcList) {
    if (pc.nextToBeginning === '…') {
      curLv = pc.level
      break
    }
  }
  return curLv
}

/**
 * 最深の丸括弧のレベル（深さ、ネスト）を返す
 * @param origPcList original parenthesis correspondence
 * @returns
 */
export function getMaxLevel(origPcList: ParenthesisCorrespondence[]): number {
  let max = 0
  for (const pc of origPcList) {
    max = Math.max(max, pc.level)
  }
  return max
}
