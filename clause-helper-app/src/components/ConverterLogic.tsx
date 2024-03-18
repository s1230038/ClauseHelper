import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { ParenthesisCorrespondence, LeftParenthesis, ReplacePair, ReplacedTarget } from './Types'

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
// 指定したtargetLevelのネストまで丸括弧を短縮表示する

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
// 短縮表示されている丸括弧のレベル（深さ、ネスト）を返す
// -1 means no collapsing parenthesis

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
// 最深の丸括弧のレベル（深さ、ネスト）を返す

export function getMaxLevel(origPcList: ParenthesisCorrespondence[]): number {
  let max = 0
  for (const pc of origPcList) {
    max = Math.max(max, pc.level)
  }
  return max
}
export function replaceKanjiClause2Num(origText: string): string {
  let converted = origText
  // 置換対象が長い方から置換テーブルに配置
  let repTable: ReplacePair[] = getReplaceTableForBranchNumber(origText)
  repTable = repTable.concat(getReplaceTableForArticleAndParagraph(origText))

  // repTableを文字数の長い要素から降順にソート。
  // 長い置換対象文字列と短い置換対象文字列に重複する文字列がある場合、
  // 先に短い方の置換をすると後の長い方の置換が行われなくなるため。
  repTable.sort((a, b) => b.from.length - a.from.length)

  // 置換処理
  console.info(repTable)
  for (const target of repTable) {
    converted = converted.replaceAll(target.from, target.to)
  }

  // 全角数字を半角数字に変換
  converted = replaceHankakuSuji2Num(converted)

  return converted
}
// 枝番号（第〇条の〇の〇の〇）の変換テーブル
function getReplaceTableForBranchNumber(origText: string): ReplacePair[] {
  // 置換対象を抽出
  const branchNest3: string[] = extractSections(
    origText,
    RegExp(
      '条の[一二三四五六七八九十百千]+の[一二三四五六七八九十百千]+の[一二三四五六七八九十百千]+',
      'g',
    ),
  )
  const branchNest2: string[] = extractSections(
    origText,
    RegExp('条の[一二三四五六七八九十百千]+の[一二三四五六七八九十百千]+', 'g'),
  )
  const branchNest1: string[] = extractSections(
    origText,
    RegExp('条の[一二三四五六七八九十百千]+', 'g'),
  )
  // 置換テーブルを生成
  let repTable: ReplacePair[] = getKanjiBranch2NumBranchTable(branchNest3)
  repTable = repTable.concat(getKanjiBranch2NumBranchTable(branchNest2))
  repTable = repTable.concat(getKanjiBranch2NumBranchTable(branchNest1))
  return repTable
}
// 第x条と第x項の置換テーブルを取得
function getReplaceTableForArticleAndParagraph(origText: string): ReplacePair[] {
  const artAndPara: ReplacedTarget[] = [
    { beginning: '第', end: '条' },
    { beginning: '第', end: '項' },
  ]
  let repTable: ReplacePair[] = []
  for (const target of artAndPara) {
    // 置換対象を抽出
    const kanjiClauseList: string[] = extractSections(
      origText,
      RegExp(target.beginning + '[一二三四五六七八九十百千]+' + target.end, 'g'),
    )

    // replacement table
    const newRepTable: ReplacePair[] = getKanjiClause2NumClauseTable(
      kanjiClauseList,
      target.beginning,
      target.end,
    )
    repTable = repTable.concat(newRepTable)
  }
  return repTable
}
function getKanjiClause2NumClauseTable(
  kanjiClauseList: string[],
  beginning: string,
  end: string,
): ReplacePair[] {
  // 置換対象文字列と置換後文字列のペアの配列を作る
  const repTable: ReplacePair[] = [] // replacement table
  for (const kanjiClause of kanjiClauseList) {
    const kanjiNumList = findKanjiNumbers(kanjiClause)
    const kanjiNum: string = kanjiNumList[0] // kanjiNumList[0]のみが存在すると想定
    const numClause: string = beginning + kanji2number(kanjiNum) + end
    repTable.push({ from: kanjiClause, to: numClause })
  }
  return repTable
}
// 枝番号（第〇条の〇の〇の〇）の変換
function getKanjiBranch2NumBranchTable(kanjiBranchList: string[]): ReplacePair[] {
  // 置換対象文字列と置換後文字列のペアの配列を作る
  const repTable: ReplacePair[] = [] // replacement table
  for (const kanjiBranch of kanjiBranchList) {
    let numBranch: string = '条'
    const kanjiNumList = findKanjiNumbers(kanjiBranch)
    for (const kanjiNum of kanjiNumList) {
      numBranch = numBranch + 'の' + kanji2number(kanjiNum)
    }
    repTable.push({ from: kanjiBranch, to: numBranch })
  }
  return repTable
}
function extractSections(text: string, regex: RegExp): string[] {
  const matches = [...new Set(text.match(regex))]
  return matches ? matches : []
}
function replaceHankakuSuji2Num(text: string): string {
  const fullNums = '０１２３４５６７８９'
  return text.replace(/[０-９]/g, (m) => fullNums.indexOf(m).toString())
}