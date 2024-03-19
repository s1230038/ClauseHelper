import { Dispatch, SetStateAction } from 'react'
import { replaceKanjiClause2Num } from '../logic/Kanji2Num'
import styles from '../styles/Home.module.css'
import { OnChangeTextArea } from './Types'

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
        placeholder="条文を貼り付け"
        value={originalText}
        onChange={handleOriginalText}
        className={styles.inputTextarea}
        data-testid="InputClause"
      />
    </>
  )
}
