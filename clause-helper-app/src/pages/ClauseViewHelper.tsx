/* eslint-disable max-lines-per-function */
import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { useState, useEffect, ChangeEvent, MouseEventHandler } from 'react'

type RadioButtonOption = { value: string; displayLabel: string }
type OnChangeInput = (event: ChangeEvent<HTMLInputElement>) => void
type OnChangeTextArea = (event: ChangeEvent<HTMLTextAreaElement>) => void
type ReplacedTarget = { beginning: string; end: string }
type ReplacePair = { from: string; to: string }
type LeftParenthesis = { level: number; beginning: number }
type ParenthesisCorrespondence = LeftParenthesis & {
  end: number
  nextToBeginning: string
  debugEnd: string
}
type ButtonProps = { onClick: MouseEventHandler<HTMLButtonElement> }

function Button({
  onClick,
  id,
  label,
  testId,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>
  id: string
  label: string
  testId: string
}) {
  return (
    <button onClick={onClick} id={id} data-testid={testId}>
      {label}
    </button>
  )
}

function ExpandAllParentheses({ onClick }: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      id="ExpandAllParentheses"
      label="丸括弧を展開"
      testId="ExpandAllParentheses"
    />
  )
}

function CollapseAllParentheses({ onClick }: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      id="CollapseAllParentheses"
      label="丸括弧を短縮"
      testId="CollapseAllParentheses"
    />
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

function CopyConvertedClause({ onClick }: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      id="CopyConvertedClause"
      label="コピー"
      testId="CopyConvertedClause"
    />
  )
}

function ConvertedClause({ convertedText }: { convertedText: string }) {
  return (
    <textarea id="ConvertedClause" value={convertedText} data-testid="ConvertedClause" readOnly />
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
    <textarea
      id="InputClause"
      placeholder="法律の条文を入力"
      value={originalText}
      onChange={onChange}
      data-testid="InputClause"
    />
  )
}

export function ClauseViewHelper() {
  const [originalText, setOriginalText] = useState('')
  const [convertedText, setConvertedText] = useState('')
  const [selectedRange, setSelectedRange] = useState('allLevels')
  const rangeOptions: RadioButtonOption[] = [
    { value: 'allLevels', displayLabel: '全階層' },
    { value: 'oneLevel', displayLabel: '１階層' },
  ]

  useEffect(() => {
    const convertText = () => setConvertedText(replaceKanjiClause2Num(originalText))
    convertText()
  }, [originalText])

  const handleRangeChange: OnChangeInput = (event) => setSelectedRange(event.target.value)
  const handleOriginalText: OnChangeTextArea = (event) => setOriginalText(event.target.value)

  const handleClickCollapsing: MouseEventHandler<HTMLButtonElement> = () => {
    const origNumClause: string = replaceKanjiClause2Num(originalText)
    const origPcList: ParenthesisCorrespondence[] = getParenthesisCorrespondence(origNumClause)
    const curPcList: ParenthesisCorrespondence[] = getParenthesisCorrespondence(convertedText)

    let collapsedText: string
    if (selectedRange === 'allLevels') {
      collapsedText = collapse(origNumClause, 0, origPcList)
    } else {
      let curLv = getCurrentLevel(curPcList)
      const maxLv = getMaxLevel(origPcList)
      curLv = curLv === -1 ? maxLv : Math.max(curLv - 1, 0)
      collapsedText = collapse(origNumClause, curLv, origPcList)
    }
    setConvertedText(collapsedText)
  }

  const handleClickExpanding: MouseEventHandler<HTMLButtonElement> = () => {
    if (selectedRange === 'allLevels') {
      setConvertedText(replaceKanjiClause2Num(originalText))
    } else {
      const origNumClause: string = replaceKanjiClause2Num(originalText)
      const origPcList: ParenthesisCorrespondence[] = getParenthesisCorrespondence(origNumClause)
      const curPcList: ParenthesisCorrespondence[] = getParenthesisCorrespondence(convertedText)

      let curLv = getCurrentLevel(curPcList)
      const maxLv = getMaxLevel(origPcList)
      curLv = curLv === -1 ? -1 : Math.min(curLv + 1, maxLv + 1)
      const collapsedText = collapse(origNumClause, curLv, origPcList)
      setConvertedText(collapsedText)
    }
  }

  return (
    <>
      <InputClause originalText={originalText} onChange={handleOriginalText} />
      <ConvertedClause convertedText={convertedText} />
      <CopyConvertedClause onClick={() => {}} />
      <ParenthesesChangeRange
        rangeOptions={rangeOptions}
        selectedRange={selectedRange}
        onChange={handleRangeChange}
      />
      <CollapseAllParentheses onClick={handleClickCollapsing} />
      <ExpandAllParentheses onClick={handleClickExpanding} />
    </>
  )
}

export function getParenthesisCorrespondence(text: string): ParenthesisCorrespondence[] {
  const lpStack: LeftParenthesis[] = []
  const pcList: ParenthesisCorrespondence[] = []

  let level: number = 0
  for (let i = 0; i < text.length; i++) {
    const char: string = text.charAt(i)

    if (char === '（' && text.charAt(i + 1) !== '」') {
      lpStack.push({ level, beginning: i })
      level++
    } else if (char === '）') {
      if (lpStack.length === 0) {
        throw new Error('The correspondence between parentheses is invalid.')
      }
      const lp: LeftParenthesis | undefined = lpStack.pop()
      level--

      if (typeof lp === 'object' && lp != null) {
        const pc: ParenthesisCorrespondence = {
          level: lp.level,
          beginning: lp.beginning,
          end: i,
          nextToBeginning: text.charAt(lp.beginning + 1),
          debugEnd: text.charAt(i + 1),
        }
        pcList.push(pc)
      } else {
        throw new Error('lpStack element is invalid.')
      }
    }
  }

  pcList.sort((a, b) => b.end - b.beginning - (a.end - a.beginning))

  return pcList
}

export function collapse(
  origText: string,
  targetLevel: number,
  pcList: ParenthesisCorrespondence[],
): string {
  const targetPcList = pcList.filter(({ level }) => level === targetLevel)

  if (targetLevel === undefined) {
    return origText
  }

  let collapsedText = origText

  for (const pc of targetPcList) {
    const pBlock = origText.slice(pc.beginning, pc.end + 1)
    collapsedText = collapsedText.replaceAll(pBlock, '（…）')
  }

  return collapsedText
}

export function getCurrentLevel(CurPcList: ParenthesisCorrespondence[]): number {
  let curLv = -1

  for (const pc of CurPcList) {
    if (pc.nextToBeginning === '…') {
      curLv = pc.level
      break
    }
  }

  return curLv
}

export function getMaxLevel(origPcList: ParenthesisCorrespondence[]): number {
  return origPcList.reduce((max, pc) => Math.max(max, pc.level), 0)
}

function replaceKanjiClause2Num(origText: string): string {
  let converted = origText

  let repTable: ReplacePair[] = getReplaceTableForBranchNumber(origText)
  repTable = repTable.concat(getReplaceTableForArticleAndParagraph(origText))
  repTable.sort((a, b) => b.from.length - a.from.length)

  for (const target of repTable) {
    converted = converted.replaceAll(target.from, target.to)
  }

  converted = replaceHankakuSuji2Num(converted)

  return converted
}

function getReplaceTableForBranchNumber(origText: string): ReplacePair[] {
  const branchNest3: string[] = extractSections(
    origText,
    RegExp(
      '条の[一二三四五六七八九十百千]+の[一二三四五六七八九十百千]+の[一二三四五六七八九十百千]+',
      'g',
    ),
  )
  const branchNest2: string[] = extractSections(
    origText,
    RegExp('条の[一二三四五六七八九十百千]+の[一二三四五六七八九十百千]+', 'g'),
  )
  const branchNest1: string[] = extractSections(
    origText,
    RegExp('条の[一二三四五六七八九十百千]+', 'g'),
  )

  let repTable: ReplacePair[] = getKanjiBranch2NumBranchTable(branchNest3)
  repTable = repTable.concat(getKanjiBranch2NumBranchTable(branchNest2))
  repTable = repTable.concat(getKanjiBranch2NumBranchTable(branchNest1))

  return repTable
}

function getReplaceTableForArticleAndParagraph(origText: string): ReplacePair[] {
  const artAndPara: ReplacedTarget[] = [
    { beginning: '第', end: '条' },
    { beginning: '第', end: '項' },
  ]

  let repTable: ReplacePair[] = []

  for (const target of artAndPara) {
    const kanjiClauseList: string[] = extractSections(
      origText,
      RegExp(target.beginning + '[一二三四五六七八九十百千]+' + target.end, 'g'),
    )

    const newRepTable: ReplacePair[] = getKanjiClause2NumClauseTable(
      kanjiClauseList,
      target.beginning,
      target.end,
    )
    repTable = repTable.concat(newRepTable)
  }

  return repTable
}

function getKanjiClause2NumClauseTable(
  kanjiClauseList: string[],
  beginning: string,
  end: string,
): ReplacePair[] {
  const repTable: ReplacePair[] = []

  for (const kanjiClause of kanjiClauseList) {
    const kanjiNumList = findKanjiNumbers(kanjiClause)
    const kanjiNum: string = kanjiNumList[0]
    const numClause: string = beginning + kanji2number(kanjiNum) + end
    repTable.push({ from: kanjiClause, to: numClause })
  }

  return repTable
}

function getKanjiBranch2NumBranchTable(kanjiBranchList: string[]): ReplacePair[] {
  const repTable: ReplacePair[] = []

  for (const kanjiBranch of kanjiBranchList) {
    let numBranch: string = '条'
    const kanjiNumList = findKanjiNumbers(kanjiBranch)

    for (const kanjiNum of kanjiNumList) {
      numBranch = numBranch + 'の' + kanji2number(kanjiNum)
    }

    repTable.push({ from: kanjiBranch, to: numBranch })
  }

  return repTable
}

function extractSections(text: string, regex: RegExp): string[] {
  const matches = [...new Set(text.match(regex))]
  return matches ? matches : []
}

function replaceHankakuSuji2Num(text: string): string {
  const fullNums = '０１２３４５６７８９'
  return text.replace(/[０-９]/g, (m) => fullNums.indexOf(m).toString())
}
