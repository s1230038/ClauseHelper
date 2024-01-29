import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  useEffect(() => {
    const convertText = () => {
      // 置換対象の条数を抽出
      const targets = extractSections(text)
      console.log(targets)
      // TODO: 置換対象文字列と置換後文字列のペアの配列を作り、それを元にtextを置換する。

      const converted = text
        .replace('第', '')
        .replace('百', '100')
        .replace('千', '1000')
        .replace('万', '10000')
        .replace('億', '100000000')
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
  const matches = text.match(regex)
  return matches ? matches : []
}

// E.g. 百四十三 -> 143, 五百 -> 500
function convertKansuji2Number(kansuji: string): number {
  const articleNum: number = 0
  const prevChar: string = ''
  const kansujiTable = new Map<string, number>([
    ['一', 1],
    ['二', 2],
    ['三', 3],
    ['四', 4],
    ['五', 5],
    ['六', 6],
    ['七', 7],
    ['八', 8],
    ['九', 9],
    ['十', 10],
    ['百', 100],
    ['千', 1000],
  ])

  for (const char of kansuji) {
    if (kansujiTable.get(char) == undefined) {
      throw new Error('Not Kansuji: ' + char)
    }
    prevChar = char
  }
}

export default App
