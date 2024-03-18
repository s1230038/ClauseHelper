import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { ReplacePair, ReplacedTarget } from '../Types'

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
