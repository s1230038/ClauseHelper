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

type RadioButtonOption = { value: string; displayLabel: string }

interface ParenthesesChangeRangeProps {
  rangeOptions: RadioButtonOption[]
  selectedRange: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ParenthesesChangeRange: React.FC<ParenthesesChangeRangeProps> = ({
  rangeOptions,
  selectedRange,
  onChange,
}) => {
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

function InputClause({ originalText }: { originalText: string }) {
  return (
    <>
      <textarea
        id="InputClause"
        placeholder="法律の条文を入力"
        value={originalText}
      />
    </>
  )
}

// dummy data
const DUMMY_ORIGINAL_TEXT =
  '第十九条の三　法第百三条の二第五項第二号（法第百三条の三第二項及び第百六条の九において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。'

const DUMMY_CONVERTED_TEXT =
  '第19条の三　法第103条の二第5項第二号（法第103条の三第2項及び第106条の九において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。'

function ClauseViewHelper() {
  const originalText: string = DUMMY_ORIGINAL_TEXT
  const convertedText: string = DUMMY_CONVERTED_TEXT
  const [selectedRange, setSelectedRange] = useState('allLevels')
  const rangeOptions: RadioButtonOption[] = [
    { value: 'allLevels', displayLabel: '全階層' },
    { value: 'oneLevel', displayLabel: '１階層' },
  ]

  const handleRangeChange = (event) => {
    setSelectedRange(event.target.value)
  }

  return (
    <>
      <InputClause originalText={originalText} />
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
