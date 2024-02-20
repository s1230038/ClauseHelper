import { render, screen, RenderResult, fireEvent } from '@testing-library/react'
import { ClauseViewHelper } from './ClauseViewHelper'

describe('Input Clause', () => {
  let renderResult: RenderResult

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    renderResult = render(<ClauseViewHelper />)
  })

  // テストケース実行後に描画していたコンポーネントを開放する
  afterEach(() => {
    renderResult.unmount()
  })

  // 初期描画時にinput要素が空であることをテスト
  it('should empty in input on initial render', () => {
    // labelがUsernameであるコンポーネントに対応するinputの要素を取得する
    const inputNodes: HTMLInputElement[] = screen.getAllByRole('textbox')

    // input要素の表示が空か確認する
    for (const n of inputNodes) {
      expect(n).toHaveValue('')
    }
  })
})
