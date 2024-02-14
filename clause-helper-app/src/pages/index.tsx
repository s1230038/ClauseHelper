import { useState } from 'react'

function ExpandAllParentheses() {
  return (
    <>
      <button id="ExpandAllParentheses">丸括弧を展開</button>
    </>
  )
}

function CollapseAllParentheses() {
  return (
    <>
      <button id="CollapseAllParentheses">丸括弧を短縮</button>
    </>
  )
}

function ParenthesesChangeRange({
  rangeOptions,
  selectedRange,
  onChange,
}: {
  rangeOptions: RadioButtonOption[]
  selectedRange: string
  onChange: OnChangeInput
}) {
  return (
    <>
      <p>丸括弧の展開／縮小の範囲</p>
      {rangeOptions.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            value={option.value}
            checked={selectedRange === option.value}
            onChange={onChange}
          />
          {option.displayLabel}
        </label>
      ))}
    </>
  )
}

function CopyConvertedClause() {
  return (
    <>
      <button id="CopyConvertedClause">コピー</button>
    </>
  )
}

function ConvertedClause({ convertedText }: { convertedText: string }) {
  return (
    <>
      <textarea id="ConvertedClause" value={convertedText} readOnly />
    </>
  )
}

function InputClause({
  originalText,
  onChange,
}: {
  originalText: string
  onChange: OnChangeTextArea
}) {
  return (
    <>
      <textarea
        id="InputClause"
        placeholder="法律の条文を入力"
        value={originalText}
        onChange={onChange}
      />
    </>
  )
}

// dummy data
const DUMMY_CONVERTED_TEXT =
  '固定：第19条の三　法第103条の二第5項第二号（法第103条の三第2項及び第106条の九において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。'

// 型エイリアス (type alias)
type RadioButtonOption = { value: string; displayLabel: string }
type OnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => void
type OnChangeTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => void

function ClauseViewHelper() {
  const [originalText, setOriginalText] = useState('')
  const convertedText: string = DUMMY_CONVERTED_TEXT
  const [selectedRange, setSelectedRange] = useState('allLevels')
  const rangeOptions: RadioButtonOption[] = [
    { value: 'allLevels', displayLabel: '全階層' },
    { value: 'oneLevel', displayLabel: '１階層' },
  ]

  const handleRangeChange: OnChangeInput = (event) => {
    setSelectedRange(event.target.value)
  }

  const handleOriginalText: OnChangeTextArea = (event) => {
    setOriginalText(event.target.value)
  }

  return (
    <>
      <InputClause originalText={originalText} onChange={handleOriginalText} />
      <ConvertedClause convertedText={convertedText} />
      <CopyConvertedClause />
      <ParenthesesChangeRange
        rangeOptions={rangeOptions}
        selectedRange={selectedRange}
        onChange={handleRangeChange}
      />
      <CollapseAllParentheses />
      <ExpandAllParentheses />
    </>
  )
}

function App() {
  return (
    <>
      <ClauseViewHelper />
    </>
  )
}

export default App
