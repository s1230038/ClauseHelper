import { useState, useEffect } from 'react'

function App() {
  const [text, setText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  useEffect(() => {
    const convertText = () => {
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

export default App
