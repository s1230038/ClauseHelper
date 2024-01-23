import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleCopy}>Copy</button>
    </div>
  )
}
