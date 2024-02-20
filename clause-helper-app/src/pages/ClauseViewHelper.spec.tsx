import { render, screen, RenderResult, fireEvent } from '@testing-library/react'
import { ClauseViewHelper } from './ClauseViewHelper'

describe('Input', () => {
  let renderResult: RenderResult

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    renderResult = render(
      <ClauseViewHelper id="username" label="InputTextArea" />,
    )
  })

  // テストケース実行後に描画していたコンポーネントを開放する
  afterEach(() => {
    renderResult.unmount()
  })
})
