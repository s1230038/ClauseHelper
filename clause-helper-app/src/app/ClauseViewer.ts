import { collapseAndExpand } from '../logic/CollapseExpand.ts'
import { replaceKanjiClause2Num } from '../logic/Kanji2Num.ts'
import type { RangeOption } from '../logic/Types.ts'

// DOM に依存しないよう、画面要素は必要なプロパティだけを持つ最小のインターフェースで受け取る
type Listenable = { addEventListener(type: string, listener: () => void): void }
export type TextElement = Listenable & { value: string }
export type RadioElement = Listenable & { value: string; checked: boolean }
export type ButtonElement = Listenable
export type ClipboardLike = { writeText(text: string): Promise<void> }

export type ClauseViewerElements = {
  inputClause: TextElement
  convertedClause: TextElement
  rangeOptions: RadioElement[]
  collapseButton: ButtonElement
  expandButton: ButtonElement
  copyButton: ButtonElement
}

/**
 * 条文ビューワーの状態と操作
 */
export class ClauseViewerState {
  originalText = ''
  convertedText = ''
  selectedRange: RangeOption = 'allLevels'

  /** 条文を入力し、漢数字を算用数字に変換する */
  input(text: string): void {
    this.originalText = text
    this.convertedText = replaceKanjiClause2Num(text)
  }

  /** 丸括弧を短縮する */
  collapse(): void {
    if (this.selectedRange === 'allLevels') {
      // 全階層を短縮
      this.convertedText = collapseAndExpand(this.originalText, this.convertedText, () => 0)
    } else {
      this.convertedText = collapseAndExpand(this.originalText, this.convertedText, (curLv, maxLv) => {
        // 短縮丸括弧が一つもなければmaxLvを代入し、一つでもあれば現在レベルー１を代入（但し０以上）
        return curLv === -1 ? maxLv : Math.max(curLv - 1, 0)
      })
    }
  }

  /** 丸括弧を展開する */
  expand(): void {
    if (this.selectedRange === 'allLevels') {
      // convert the original text into the replaced one again
      this.convertedText = replaceKanjiClause2Num(this.originalText)
    } else {
      this.convertedText = collapseAndExpand(this.originalText, this.convertedText, (curLv, maxLv) => {
        // 短縮丸括弧が一つもなければそのまま-1とし、一つでもあれば現在レベル＋１を代入（但しmaxLv+1以下）
        return curLv === -1 ? -1 : Math.min(curLv + 1, maxLv + 1)
      })
    }
  }
}

/**
 * 画面要素にイベントを登録し、状態を画面に反映する
 * @param elements screen elements
 * @param clipboard clipboard
 * @returns state
 */
export function mountClauseViewer(
  elements: ClauseViewerElements,
  clipboard: ClipboardLike,
): ClauseViewerState {
  const state = new ClauseViewerState()
  const { inputClause, convertedClause, rangeOptions } = elements

  const render = (): void => {
    inputClause.value = state.originalText
    convertedClause.value = state.convertedText
    for (const option of rangeOptions) {
      option.checked = option.value === state.selectedRange
    }
  }

  inputClause.addEventListener('input', () => {
    state.input(inputClause.value)
    render()
  })
  for (const option of rangeOptions) {
    option.addEventListener('change', () => {
      if (option.checked) {
        state.selectedRange = option.value as RangeOption
      }
      render()
    })
  }
  elements.collapseButton.addEventListener('click', () => {
    state.collapse()
    render()
  })
  elements.expandButton.addEventListener('click', () => {
    state.expand()
    render()
  })
  elements.copyButton.addEventListener('click', () => {
    clipboard.writeText(state.convertedText).then(
      () => console.info('copying into clipboard successfully completed.'),
      () => console.error('Copying fails.'),
    )
  })

  render()
  return state
}
