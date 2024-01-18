import { render, screen, RenderResult, fireEvent, getByRole } from '@testing-library/react'
import { Input } from './index'

// describeで処理をまとめる
describe('Input', () => {
  let renderResult: RenderResult

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    renderResult = render(<Input id="username" label="Username" />)
  })

  // テストケース実行後に描画していたコンポーネントを開放する
  afterEach(() => {
    renderResult.unmount()
  })

  // 初期描画時にinput要素が空であることをテスト
  it('should empty in input on initial render', () => {
    // labelがUsernameであるコンポーネントに対応するinputの要素を取得する
    const inputNode = screen.getByLabelText('Username') as HTMLInputElement

    // input要素の表示が空か確認する
    expect(inputNode).toHaveValue('')
  })

  // 文字を入力したら、入力した内容が表示されるかをテスト
  it('should show input text', () => {
    const inputText = 'Test Input Text'
    const inputNode = screen.getByLabelText('Username') as HTMLInputElement

    // fireEventを使って、input要素のonChangeイベントを発火する
    fireEvent.change(inputNode, { target: { value: inputText } })

    // input要素に入力したテキストが表示されているか確認する
    expect(inputNode).toHaveValue(inputText)
  })

  // ボタンが押されたら、入力テキストがクリアするかチェック
  it('should reset when user clicks button', () => {
    // 最初にinputにテキストを入力する
    const inputText = 'Test Input Text'
    const inputNode = screen.getByLabelText('Username') as HTMLInputElement
    fireEvent.change(inputNode, { target: { value: inputText } })

    // ボタンを取得する
    const buttonNode = screen.getByRole('button', {
      name: 'Reset',
    }) as HTMLButtonElement
    // ボタンをクリックする
    fireEvent.click(buttonNode)

    // input要素の表示が空か確認する
    expect(inputNode).toHaveValue('')
  })
})