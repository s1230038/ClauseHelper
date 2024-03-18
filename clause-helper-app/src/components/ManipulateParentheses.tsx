import { MouseEventHandler, Dispatch, SetStateAction } from 'react'
import { collapseAndExpand } from './ConverterLogic'
import { replaceKanjiClause2Num } from './Kanji2NumLogic'

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
