import { MouseEventHandler, Dispatch, SetStateAction } from 'react'
import styles from '../styles/Home.module.css'
import { replaceKanjiClause2Num, collapseAndExpand } from './ConverterLogic'
import { RadioButtonOption, OnChangeInput, OnChangeTextArea } from './Types'

export function ExpandAllParentheses({
  originalText,
  convertedText,
  selectedRange,
  setConvertedText,
}: {
  originalText: string
  convertedText: string
  selectedRange: string
  setConvertedText: Dispatch<SetStateAction<string>>
}) {
  const handleClickExpanding: MouseEventHandler<HTMLButtonElement> = () => {
    if (selectedRange === 'allLevels') {
      // convert the original text into the replaced one again
      setConvertedText(replaceKanjiClause2Num(originalText))
    } else {
      const collapsedText = collapseAndExpand(originalText, convertedText, (curLv, maxLv) => {
        // 短縮丸括弧が一つもなければそのまま-1とし、一つでもあれば現在レベル＋１を代入（但しmaxLv+1以下）
        return curLv === -1 ? -1 : Math.min(curLv + 1, maxLv + 1)
      })
      setConvertedText(collapsedText)
    }
  }
  return (
    <>
      <button
        onClick={handleClickExpanding}
        id="ExpandAllParentheses"
        data-testid="ExpandAllParentheses"
      >
        展開
      </button>
    </>
  )
}

export function CollapseAllParentheses({
  selectedRange,
  originalText,
  convertedText,
  setConvertedText,
}: {
  selectedRange: string
  originalText: string
  convertedText: string
  setConvertedText: Dispatch<SetStateAction<string>>
}) {
  const handleClickCollapsing: MouseEventHandler<HTMLButtonElement> = () => {
    let collapsedText: string
    if (selectedRange === 'allLevels') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      collapsedText = collapseAndExpand(originalText, convertedText, (_curLv, _maxLv) => {
        // 全階層を短縮
        return 0
      })
    } else {
      collapsedText = collapseAndExpand(originalText, convertedText, (curLv, maxLv) => {
        // 短縮丸括弧が一つもなければmaxLvを代入し、一つでもあれば現在レベルー１を代入（但し０以上）
        return curLv === -1 ? maxLv : Math.max(curLv - 1, 0)
      })
    }
    setConvertedText(collapsedText)
  }
  return (
    <>
      <button
        onClick={handleClickCollapsing}
        id="CollapseAllParentheses"
        data-testid="CollapseAllParentheses"
      >
        短縮
      </button>
    </>
  )
}

export function ParenthesesChangeRange({
  rangeOptions,
  selectedRange,
  setSelectedRange,
}: {
  rangeOptions: RadioButtonOption[]
  selectedRange: string
  setSelectedRange: Dispatch<SetStateAction<string>>
}) {
  const handleRangeChange: OnChangeInput = (event) => {
    setSelectedRange(event.target.value)
  }

  return (
    <>
      <p>丸括弧の</p>
      {rangeOptions.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            value={option.value}
            checked={selectedRange === option.value}
            onChange={handleRangeChange}
          />
          {option.displayLabel}
        </label>
      ))}
      <p>を</p>
    </>
  )
}

export function CopyConvertedClause({ convertedText }: { convertedText: string }) {
  const handleClickCopyingText: MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      await navigator.clipboard.writeText(convertedText)
      console.info('copying into clipboard successfully completed.')
    } catch (error) {
      console.error('Copying fails.')
    }
  }

  return (
    <>
      <button
        id="CopyConvertedClause"
        onClick={handleClickCopyingText}
        data-testid="CopyConvertedClause"
      >
        変換後をコピー
      </button>
    </>
  )
}

export function ConvertedClause({ convertedText }: { convertedText: string }) {
  return (
    <>
      <textarea id="ConvertedClause" value={convertedText} data-testid="ConvertedClause" readOnly />
    </>
  )
}

export function InputClause({
  originalText,
  setOriginalText,
  setConvertedText,
}: {
  originalText: string
  setOriginalText: Dispatch<SetStateAction<string>>
  setConvertedText: Dispatch<SetStateAction<string>>
}) {
  const handleOriginalText: OnChangeTextArea = (event) => {
    setOriginalText(event.target.value)
    const numClause: string = replaceKanjiClause2Num(event.target.value)
    setConvertedText(numClause)
  }

  return (
    <>
      <textarea
        id="InputClause"
        placeholder="法律の条文を貼り付け"
        value={originalText}
        onChange={handleOriginalText}
        className={styles.inputTextarea}
        data-testid="InputClause"
      />
    </>
  )
}
