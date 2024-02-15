import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { useState, useEffect } from 'react'

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

// 型エイリアス (type alias)
type RadioButtonOption = { value: string; displayLabel: string }
type OnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => void
type OnChangeTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => void
type replacedTarget = { beginning: string; end: string }
type ReplacePair = { from: string; to: string }

function ClauseViewHelper() {
  const [originalText, setOriginalText] = useState('')
  const [convertedText, setConvertedText] = useState('')
  useEffect(() => {
    const convertText = () => {
      const converted: string = replaceKanjiClause2Num(
        originalText,
        { beginning: '第', end: '条' },
        { beginning: '第', end: '項' },
      )
      setConvertedText(converted)
    }
    convertText()
  }, [originalText])

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

function App() {
  return (
    <>
      <ClauseViewHelper />
    </>
  )
}

export default App
