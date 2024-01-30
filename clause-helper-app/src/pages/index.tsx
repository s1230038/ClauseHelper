import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  useEffect(() => {
    const convertText = () => {
      const converted: string = replaceKanjiClause2Num(text)
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
type KanjiClause2numClause = { kanjiClause: string; numClause: string }
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
    // 置換対象文字列と置換後文字列のペアの配列を作り、それを元にtextを置換する。
    const repTable: KanjiClause2numClause[] = [] // replacement table
    for (const kanjiClause of kanjiClauseList) {
      const kanjiNumList = findKanjiNumbers(kanjiClause)
      const kanjiNum: string = kanjiNumList[0] // kanjiNumList[0]のみが存在すると想定
      const numClause: string =
        target.beginning + kanji2number(kanjiNum) + target.end
      repTable.push({ kanjiClause, numClause })
    }
    console.log(repTable)
    // 置換処理
    for (const target of repTable) {
      converted = converted.replaceAll(target.kanjiClause, target.numClause)
    }
  }

  // TODO: 全角数字を半角数字に変換

  return converted
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

export default App
