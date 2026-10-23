// 型エイリアス (type alias)

export type RangeOption = 'allLevels' | 'oneLevel'
export type ReplacedTarget = { beginning: string; end: string }
export type ReplacePair = { from: string; to: string }
export type LeftParenthesis = { level: number; beginning: number }
export type ParenthesisCorrespondence = LeftParenthesis & {
  end: number
  nextToBeginning: string
  debugEnd: string
}
