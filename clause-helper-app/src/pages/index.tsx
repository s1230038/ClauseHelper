import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  useEffect(() => {
    const convertText = () => {
      // 置換対象の条数を抽出
      const kanjiClauseList = extractSections(text)
      console.log(kanjiClauseList)
      // 置換対象文字列と置換後文字列のペアの配列を作り、それを元にtextを置換する。
      type KanjiClause2numClause = { kanjiClause: string; numClause: string }
      const repTable: KanjiClause2numClause[] = [] // replacement table
      for (const kanjiClause of kanjiClauseList) {
        const kanjiNumList = findKanjiNumbers(kanjiClause)
        const kanjiNum: string = kanjiNumList[0] // kanjiNumList[0]のみが存在すると想定
        const numClause: string = '第' + kanji2number(kanjiNum) + '条'
        repTable.push({ kanjiClause, numClause })
      }
      console.log(repTable)
      // TODO: 全角数字を半角数字に変換
      // TODO: 第n項の漢数字も数字に変換

      // 置換処理
      let converted = text
      for (const target of repTable) {
        converted = converted.replaceAll(target.kanjiClause, target.numClause)
      }

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

function extractSections(text: string): string[] {
  const regex = /第[一二三四五六七八九十百千]+条/g
  const matches = [...new Set(text.match(regex))]
  return matches ? matches : []
}

export default App
