import Link from 'next/link'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import { InputClause, ConvertedClause } from './ClauseTextarea'
import { CopyConvertedClause } from './CopyConvertedClause'
import { CollapseAllParentheses, ExpandAllParentheses } from './ManipulateParentheses'
import { ParenthesesChangeRange } from './ParenthesesChangeRange'
import { RadioButtonOption } from './Types'

export function ClauseViewer() {
  const [originalText, setOriginalText] = useState('')
  const [convertedText, setConvertedText] = useState('')

  const [selectedRange, setSelectedRange] = useState('allLevels')
  const rangeOptions: RadioButtonOption[] = [
    { value: 'allLevels', displayLabel: '全階層' },
    { value: 'oneLevel', displayLabel: '１階層' },
  ]

  return (
    <div className={styles.container}>
      <title>条文ビューワー</title>
      <div className={styles.header}>
        <h1>条文ビューワー</h1>
        <p>
          条文を張り付けると、条と項の漢数字のみ算用数字に変換して下段に表示します。条文中の丸括弧を短縮することもできます。
        </p>
      </div>
      <div className={styles.main}>
        <InputClause {...{ originalText, setOriginalText, setConvertedText }} />
        <ConvertedClause {...{ convertedText }} />
      </div>
      <div className={styles.footer}>
        <div className={styles.manipulator}>
          <CopyConvertedClause {...{ convertedText }} />
          <div className={styles.parentheses}>
            <ParenthesesChangeRange {...{ rangeOptions, selectedRange, setSelectedRange }} />
            <CollapseAllParentheses
              {...{ selectedRange, originalText, convertedText, setConvertedText }}
            />
            <ExpandAllParentheses
              {...{ originalText, convertedText, selectedRange, setConvertedText }}
            />
          </div>
        </div>
        <div className={styles.termsofuse}>
          <Link href="/TermsOfUse">免責事項</Link>
        </div>
      </div>
    </div>
  )
}
