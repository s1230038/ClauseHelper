/* eslint-disable no-irregular-whitespace */
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

  // 初期描画時にtextbox Roleが空であることをテスト
  it('should empty in input on initial render', () => {
    // Roleがtextboxであるコンポーネントに対応するinputの要素を取得する
    const inputNodes: HTMLInputElement[] = screen.getAllByRole('textbox')

    // input要素の表示が空か確認する
    for (const n of inputNodes) {
      expect(n).toHaveValue('')
    }
  })

  // 初期描画時にtextbox Roleが空であることをテスト
  it('should convert Kansuji clause into numerical one', () => {
    // labelがUsernameであるコンポーネントに対応するinputの要素を取得する
    const inputNode: HTMLInputElement = screen.getByTestId('InputClause')
    const convertedNode: HTMLInputElement =
      screen.getByTestId('ConvertedClause')

    const inputText: string = `第十九条の三　法第百三条の二第五項第二号（法第百三条の三第二項及び第百六条の九において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。
    一　共同で株式会社金融商品取引所（法第二条第十八項に規定する株式会社金融商品取引所をいう。以下同じ。）の対象議決権（法第百三条の二第一項に規定する対象議決権をいう。以下この号、第十九条の三の三、第十九条の三の三の二及び第十九条の三の四の二において同じ。）を取得し、若しくは保有し、又は当該株式会社金融商品取引所の対象議決権を行使することを合意している者（以下この条において「共同保有者」という。）の関係
    二　夫婦の関係
    三　会社の総株主等の議決権の百分の五十を超える議決権を保有している者（以下この条において「支配株主等」という。）と当該会社（以下この条において「被支配会社」という。）との関係
    四　被支配会社とその支配株主等の他の被支配会社との関係`

    const convertedText = `第19条の3　法第103条の2第5項第二号（法第103条の3第2項及び第106条の9において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。
    一　共同で株式会社金融商品取引所（法第2条第18項に規定する株式会社金融商品取引所をいう。以下同じ。）の対象議決権（法第103条の2第1項に規定する対象議決権をいう。以下この号、第19条の3の3、第19条の3の3の2及び第19条の3の4の2において同じ。）を取得し、若しくは保有し、又は当該株式会社金融商品取引所の対象議決権を行使することを合意している者（以下この条において「共同保有者」という。）の関係
    二　夫婦の関係
    三　会社の総株主等の議決権の百分の五十を超える議決権を保有している者（以下この条において「支配株主等」という。）と当該会社（以下この条において「被支配会社」という。）との関係
    四　被支配会社とその支配株主等の他の被支配会社との関係`

    // fireEventを使って、inputNodeのonChangeイベントを発火する
    fireEvent.change(inputNode, { target: { value: inputText } })
    // convertedNodeに変換されたテキストが表示されているか確認する
    expect(convertedNode).toHaveValue(convertedText)
  })
})
