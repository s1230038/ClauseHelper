import { MouseEventHandler } from 'react'

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
