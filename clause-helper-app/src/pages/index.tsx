import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  useEffect(() => {
    const convertText = () => {
      const converted: string = replaceKanjiClause2Num(
        text,
        { beginning: '第', end: '条' },
        { beginning: '第', end: '項' },
      )
      setConvertedText(converted)
    }
    convertText()
  }, [text])

  return (
    <div>
      <textarea
        id="text"
        placeholder="法律の条文を入力"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button id="convert">算用数字に変換</button>
      <textarea id="convertedText" value={convertedText} readOnly />
    </div>
  )
}

type replacedTarget = { beginning: string; end: string }
type ReplacePair = { from: string; to: string }
function replaceKanjiClause2Num(
  origText: string,
  ...targets: replacedTarget[]
): string {
  let converted = origText
  for (const target of targets) {
    // 置換対象を抽出
    const kanjiClauseList: string[] = extractSections(
      origText,
      target.beginning,
      target.end,
    )
    console.log(kanjiClauseList)
    // replacement table
    const repTable: ReplacePair[] = getKanjiClause2NumClauseTable(
      kanjiClauseList,
      target.beginning,
      target.end,
    )

    console.log(repTable)
    // 置換処理
    for (const target of repTable) {
      converted = converted.replaceAll(target.from, target.to)
    }
  }

  // 全角数字を半角数字に変換
  converted = replaceHankakuSuji2Num(converted)

  return converted
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

function extractSections(
  text: string,
  beginning: string,
  end: string,
): string[] {
  const regex = new RegExp(beginning + '[一二三四五六七八九十百千]+' + end, 'g')
  const matches = [...new Set(text.match(regex))]
  return matches ? matches : []
}

function replaceHankakuSuji2Num(text: string): string {
  const fullNums = '０１２３４５６７８９'
  return text.replace(/[０-９]/g, (m) => fullNums.indexOf(m).toString())
}

export default App
