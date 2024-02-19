import { render, screen, RenderResult, fireEvent } from '@testing-library/react'
import App from './index'

describe('Input', () => {
  let renderResult: RenderResult

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    renderResult = render(<App label="InputTextArea" />)
  })

  // テストケース実行後に描画していたコンポーネントを開放する
  afterEach(() => {
    renderResult.unmount()
  })
})
