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

export default App
