import { Dispatch, SetStateAction } from 'react'
import { RadioButtonOption, OnChangeInput } from './Types'

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
