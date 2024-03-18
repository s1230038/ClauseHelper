// 型エイリアス (type alias)

export type RadioButtonOption = { value: string; displayLabel: string }
export type OnChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => void
export type OnChangeTextArea = (event: React.ChangeEvent<HTMLTextAreaElement>) => void
export type ReplacedTarget = { beginning: string; end: string }
export type ReplacePair = { from: string; to: string }
export type LeftParenthesis = { level: number; beginning: number }
export type ParenthesisCorrespondence = LeftParenthesis & {
  end: number
  nextToBeginning: string
  debugEnd: string
}
