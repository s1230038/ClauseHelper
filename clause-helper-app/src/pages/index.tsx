import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  useEffect(() => {
    const convertText = () => {
      // 置換対象の条数を抽出
      const targets = extractSections(text)
      console.log(targets)

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
  const regex = /\b第(\d+)条\b/g
  const extracts: RegExpExecArray | null = regex.exec(text)
  return extracts !== null ? extracts.map((match) => match[1]) : ['']
}

export default App
