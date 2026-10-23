import { mountClauseViewer } from './app/ClauseViewer.ts'

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (element === null) {
    throw new Error(`Element not found: #${id}`)
  }
  return element as T
}

mountClauseViewer(
  {
    inputClause: getElement<HTMLTextAreaElement>('InputClause'),
    convertedClause: getElement<HTMLTextAreaElement>('ConvertedClause'),
    rangeOptions: [
      getElement<HTMLInputElement>('allLevelsInput'),
      getElement<HTMLInputElement>('oneLevelInput'),
    ],
    collapseButton: getElement<HTMLButtonElement>('CollapseAllParentheses'),
    expandButton: getElement<HTMLButtonElement>('ExpandAllParentheses'),
    copyButton: getElement<HTMLButtonElement>('CopyConvertedClause'),
  },
  navigator.clipboard,
)
