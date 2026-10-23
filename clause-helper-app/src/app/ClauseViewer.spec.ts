import assert from 'node:assert/strict'
import { beforeEach, describe, it } from 'node:test'
import { collapse, getParenthesisCorrespondence } from '../logic/CollapseExpand.ts'
import { mountClauseViewer } from './ClauseViewer.ts'

// テスト用の簡易DOM。ブラウザの要素の振る舞いのうち、このアプリが使う部分だけを再現する
class FakeElement {
  value: string
  checked = false
  readonly label: string
  private readonly listeners = new Map<string, (() => void)[]>()

  constructor(value = '', label = '') {
    this.value = value
    this.label = label
  }

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
  }

  dispatch(type: string): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener()
    }
  }
}

class FakeRadio extends FakeElement {
  group: FakeRadio[] = []
}

const fireEvent = {
  // テキストエリアへの入力
  change(element: FakeElement, { target }: { target: { value: string } }): void {
    element.value = target.value
    element.dispatch('input')
  },
  // クリック。ラジオボタンは同じグループ内で選択を切り替え、選択が変わったときだけ change を発火する
  click(element: FakeElement): void {
    if (element instanceof FakeRadio && !element.checked) {
      for (const radio of element.group) {
        radio.checked = radio === element
      }
      element.dispatch('change')
    }
    element.dispatch('click')
  },
}

type Screen = ReturnType<typeof render>

// public/index.html と同じ構成の画面を作り、アプリを組み込む
function render() {
  const elements = {
    InputClause: new FakeElement(),
    ConvertedClause: new FakeElement(),
    CollapseAllParentheses: new FakeElement(),
    ExpandAllParentheses: new FakeElement(),
    CopyConvertedClause: new FakeElement(),
  }
  const rangeOptions = [new FakeRadio('allLevels', '全階層'), new FakeRadio('oneLevel', '１階層')]
  rangeOptions[0].checked = true
  for (const radio of rangeOptions) {
    radio.group = rangeOptions
  }
  let clipboardText = ''
  const clipboard = {
    async writeText(text: string): Promise<void> {
      clipboardText = text
    },
    async readText(): Promise<string> {
      return clipboardText
    },
  }

  mountClauseViewer(
    {
      inputClause: elements.InputClause,
      convertedClause: elements.ConvertedClause,
      rangeOptions,
      collapseButton: elements.CollapseAllParentheses,
      expandButton: elements.ExpandAllParentheses,
      copyButton: elements.CopyConvertedClause,
    },
    clipboard,
  )

  return {
    clipboard,
    getByTestId(testId: keyof typeof elements): FakeElement {
      return elements[testId]
    },
    getByLabelText(label: string): FakeElement {
      const radio = rangeOptions.find((option) => option.label === label)
      if (radio === undefined) throw new Error(`Label not found: ${label}`)
      return radio
    },
    getAllByRole(role: 'textbox'): FakeElement[] {
      return role === 'textbox' ? [elements.InputClause, elements.ConvertedClause] : []
    },
  }
}

describe('Input Clause', () => {
  let screen: Screen

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    screen = render()
  })


  // 初期描画時にtextbox Roleが空であることをテスト
  it('should empty in input on initial render', () => {
    // Roleがtextboxであるコンポーネントに対応するinputの要素を取得する
    const inputNodes: FakeElement[] = screen.getAllByRole('textbox')

    // input要素の表示が空か確認する
    for (const n of inputNodes) {
      assert.equal(n.value, '')
    }
  })

  // 条文の漢数字が算用数字に変換されていることをテスト（通常）
  it('should convert Kansuji clause into numerical one as normal case', () => {
    // TestIdがInputClauseであるコンポーネントに対応するinputの要素を取得する
    const inputNode: FakeElement = screen.getByTestId('InputClause')
    const convertedNode: FakeElement = screen.getByTestId('ConvertedClause')

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
    assert.equal(convertedNode.value, convertedText)
  })

  // 条文の漢数字が算用数字に変換されていることをテスト（トリッキーな枝番号。「十三」が「10三」にはならないか）
  it('should convert Kansuji clause into numerical one as tricky branch', () => {
    // TestIdがInputClauseであるコンポーネントに対応するinputの要素を取得する
    const inputNode: FakeElement = screen.getByTestId('InputClause')
    const convertedNode: FakeElement = screen.getByTestId('ConvertedClause')

    const inputText: string = `（現実売買等による相場操縦行為をした者に対する課徴金につき自己の計算において有価証券の買付け等をしたものとみなす場合）
    第三十三条の十三　法第百七十四条の二第八項に規定する政令で定める場合は、次に掲げる場合とする。
    一　違反者又は特定関係者（当該違反者と同一の違反行為をした者を除く。）が違反行為の開始時に当該違反行為に係る有価証券又は商品を所有している場合
    二　違反者が違反行為の開始時に自己又は特定関係者の計算において当該違反行為に係る商品の買付け（市場デリバティブ取引（法第二条第二十一項第一号に掲げる取引に限る。）による買付けに限る。）をしている場合（当該特定関係者が当該違反者と同一の違反行為をした場合にあつては、当該特定関係者が自己の計算において当該買付けをしている場合を除く。）
    三　違反者が違反行為の開始時に当該違反行為に係る有価証券等について自己又は特定関係者の計算において第三十三条の十一第二号から第六号までに掲げる取引を約定している場合（当該特定関係者が当該違反者と同一の違反行為をした場合にあつては、当該特定関係者が自己の計算において当該取引を約定している場合を除く。）`

    const convertedText = `（現実売買等による相場操縦行為をした者に対する課徴金につき自己の計算において有価証券の買付け等をしたものとみなす場合）
    第33条の13　法第174条の2第8項に規定する政令で定める場合は、次に掲げる場合とする。
    一　違反者又は特定関係者（当該違反者と同一の違反行為をした者を除く。）が違反行為の開始時に当該違反行為に係る有価証券又は商品を所有している場合
    二　違反者が違反行為の開始時に自己又は特定関係者の計算において当該違反行為に係る商品の買付け（市場デリバティブ取引（法第2条第21項第一号に掲げる取引に限る。）による買付けに限る。）をしている場合（当該特定関係者が当該違反者と同一の違反行為をした場合にあつては、当該特定関係者が自己の計算において当該買付けをしている場合を除く。）
    三　違反者が違反行為の開始時に当該違反行為に係る有価証券等について自己又は特定関係者の計算において第33条の11第二号から第六号までに掲げる取引を約定している場合（当該特定関係者が当該違反者と同一の違反行為をした場合にあつては、当該特定関係者が自己の計算において当該取引を約定している場合を除く。）`

    // fireEventを使って、inputNodeのonChangeイベントを発火する
    fireEvent.change(inputNode, { target: { value: inputText } })
    // convertedNodeに変換されたテキストが表示されているか確認する
    assert.equal(convertedNode.value, convertedText)
  })

  // 条文の漢数字が算用数字に変換されていることをテスト（項と号の混在）
  it('should convert Kansuji clause into numerical one as mixed Kou and Gou', () => {
    // TestIdがInputClauseであるコンポーネントに対応するinputの要素を取得する
    const inputNode: FakeElement = screen.getByTestId('InputClause')
    const convertedNode: FakeElement = screen.getByTestId('ConvertedClause')

    const inputText: string = `第二百六十四条の十　管理不全土地管理人は、管理不全土地管理命令の対象とされた土地及び管理不全土地管理命令の効力が及ぶ動産並びにその管理、処分その他の事由により管理不全土地管理人が得た財産（以下「管理不全土地等」という。）の管理及び処分をする権限を有する。
    ２　管理不全土地管理人が次に掲げる行為の範囲を超える行為をするには、裁判所の許可を得なければならない。ただし、この許可がないことをもって善意でかつ過失がない第三者に対抗することはできない。
    一　保存行為
    二　管理不全土地等の性質を変えない範囲内において、その利用又は改良を目的とする行為
    ３　管理不全土地管理命令の対象とされた土地の処分についての前項の許可をするには、その所有者の同意がなければならない。`

    const convertedText = `第264条の10　管理不全土地管理人は、管理不全土地管理命令の対象とされた土地及び管理不全土地管理命令の効力が及ぶ動産並びにその管理、処分その他の事由により管理不全土地管理人が得た財産（以下「管理不全土地等」という。）の管理及び処分をする権限を有する。
    2　管理不全土地管理人が次に掲げる行為の範囲を超える行為をするには、裁判所の許可を得なければならない。ただし、この許可がないことをもって善意でかつ過失がない第三者に対抗することはできない。
    一　保存行為
    二　管理不全土地等の性質を変えない範囲内において、その利用又は改良を目的とする行為
    3　管理不全土地管理命令の対象とされた土地の処分についての前項の許可をするには、その所有者の同意がなければならない。`

    // fireEventを使って、inputNodeのonChangeイベントを発火する
    fireEvent.change(inputNode, { target: { value: inputText } })
    // convertedNodeに変換されたテキストが表示されているか確認する
    assert.equal(convertedNode.value, convertedText)
  })
})

describe('Parentheses Change Range', () => {
  let screen: Screen

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    screen = render()
  })


  // 初期描画時
  it('should be selected in the radio buttons on initial render', () => {
    const optionAllLevel: FakeElement = screen.getByLabelText('全階層')
    const optionOneLevel: FakeElement = screen.getByLabelText('１階層')

    assert.equal(optionAllLevel.checked, true)
    assert.equal(optionOneLevel.checked, false)
  })

  // クリックによる変更
  it('should be changed when clicking radio button', () => {
    const optionAllLevel: FakeElement = screen.getByLabelText('全階層')
    const optionOneLevel: FakeElement = screen.getByLabelText('１階層')

    // ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)

    assert.equal(optionAllLevel.checked, false)
    assert.equal(optionOneLevel.checked, true)
  })

  // クリックによる変更（元に戻る）
  it('should be reverted when clicking twice', () => {
    const optionAllLevel: FakeElement = screen.getByLabelText('全階層')
    const optionOneLevel: FakeElement = screen.getByLabelText('１階層')

    // ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    fireEvent.click(optionAllLevel)

    assert.equal(optionAllLevel.checked, true)
    assert.equal(optionOneLevel.checked, false)
  })
})

describe('Function test: collapse()', () => {
  // https://note.com/lawyer_alpaca/n/ne09c189e813b
  it('should replace parenthesis blocks', () => {
    const inputText =
      '事業者（中間処理業者（発生から最終処分（埋立処分、海洋投入処分（海洋汚染等及び海上災害の防止に関する法律に基づき定められた海洋への投入の場所及び方法に関する基準に従つて行う処分をいう。）又は再生をいう。以下同じ。）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。'

    const expected0 =
      '事業者（…）は、その産業廃棄物（…）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。'

    const expected1 =
      '事業者（中間処理業者（…）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（…）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。'

    const expected2 =
      '事業者（中間処理業者（発生から最終処分（…）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。'

    const expected3 =
      '事業者（中間処理業者（発生から最終処分（埋立処分、海洋投入処分（…）又は再生をいう。以下同じ。）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。'

    const pcList = getParenthesisCorrespondence(inputText)
    let result = collapse(inputText, 0, pcList)
    assert.equal(result, expected0)

    result = collapse(inputText, 1, pcList)
    assert.equal(result, expected1)

    result = collapse(inputText, 2, pcList)
    assert.equal(result, expected2)

    result = collapse(inputText, 3, pcList)
    assert.equal(result, expected3)

    // abnormal case
    result = collapse(inputText, 4, pcList) // level exceeds the existing
    assert.equal(result, inputText)

    result = collapse(inputText, 0, []) // pcList is "undefined"
    assert.equal(result, inputText)
  })

  it('should replace tricky parenthesis blocks', () => {
    const inputText = `２　前項の規定による特別取締役による議決の定めがある場合には、特別取締役以外の取締役は、第三百六十二条第四項第一号及び第二号又は第三百九十九条の十三第四項第一号及び第二号に掲げる事項の決定をする取締役会に出席することを要しない。この場合における第三百六十六条第一項本文及び第三百六十八条の規定の適用については、第三百六十六条第一項本文中「各取締役」とあるのは「各特別取締役（第三百七十三条第一項に規定する特別取締役をいう。第三百六十八条において同じ。）」と、第三百六十八条第一項中「定款」とあるのは「取締役会」と、「各取締役」とあるのは「各特別取締役」と、同条第二項中「取締役（」とあるのは「特別取締役（」と、「取締役及び」とあるのは「特別取締役及び」とする。`
    const expected0 = `２　前項の規定による特別取締役による議決の定めがある場合には、特別取締役以外の取締役は、第三百六十二条第四項第一号及び第二号又は第三百九十九条の十三第四項第一号及び第二号に掲げる事項の決定をする取締役会に出席することを要しない。この場合における第三百六十六条第一項本文及び第三百六十八条の規定の適用については、第三百六十六条第一項本文中「各取締役」とあるのは「各特別取締役（…）」と、第三百六十八条第一項中「定款」とあるのは「取締役会」と、「各取締役」とあるのは「各特別取締役」と、同条第二項中「取締役（」とあるのは「特別取締役（」と、「取締役及び」とあるのは「特別取締役及び」とする。`

    const pcList = getParenthesisCorrespondence(inputText)
    const result = collapse(inputText, 0, pcList)
    assert.equal(result, expected0)
  })
})

describe('Collapse and expand parenthesis blocks', () => {
  let screen: Screen
  let inputNode: FakeElement
  let convertedNode: FakeElement
  let optionAllLevel: FakeElement
  let optionOneLevel: FakeElement
  let expandNode: FakeElement
  let collapseNode: FakeElement

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    screen = render()
    inputNode = screen.getByTestId('InputClause')
    convertedNode = screen.getByTestId('ConvertedClause')
    optionAllLevel = screen.getByLabelText('全階層')
    optionOneLevel = screen.getByLabelText('１階層')
    expandNode = screen.getByTestId('ExpandAllParentheses')
    collapseNode = screen.getByTestId('CollapseAllParentheses')
  })


  const inputText = `５　事業者（中間処理業者（発生から最終処分（埋立処分、海洋投入処分（海洋汚染等及び海上災害の防止に関する法律に基づき定められた海洋への投入の場所及び方法に関する基準に従つて行う処分をいう。）又は再生をいう。以下同じ。）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第七項並びに次条第五項から第七項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第七項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第十四条第十二項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。`

  const expected0 = `5　事業者（…）は、その産業廃棄物（…）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。`

  const expected1 = `5　事業者（中間処理業者（…）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（…）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。`

  const expected2 = `5　事業者（中間処理業者（発生から最終処分（…）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。`

  const expected3 = `5　事業者（中間処理業者（発生から最終処分（埋立処分、海洋投入処分（…）又は再生をいう。以下同じ。）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。`

  const expected4 = `5　事業者（中間処理業者（発生から最終処分（埋立処分、海洋投入処分（海洋汚染等及び海上災害の防止に関する法律に基づき定められた海洋への投入の場所及び方法に関する基準に従つて行う処分をいう。）又は再生をいう。以下同じ。）が終了するまでの一連の処理の行程の中途において産業廃棄物を処分する者をいう。以下同じ。）を含む。次項及び第7項並びに次条第5項から第7項までにおいて同じ。）は、その産業廃棄物（特別管理産業廃棄物を除くものとし、中間処理産業廃棄物（発生から最終処分が終了するまでの一連の処理の行程の中途において産業廃棄物を処分した後の産業廃棄物をいう。以下同じ。）を含む。次項及び第7項において同じ。）の運搬又は処分を他人に委託する場合には、その運搬については第14条第12項に規定する産業廃棄物収集運搬業者その他環境省令で定める者に、その処分については同項に規定する産業廃棄物処分業者その他環境省令で定める者にそれぞれ委託しなければならない。`

  it('should collapse and expand by each one level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    assert.equal(convertedNode.value, expected4)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    assert.equal(convertedNode.value, expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected3)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected2)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected1)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // 既に全レベルを短縮した状態であえて短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected1)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected2)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected3)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
  })
  it('should collapse and expand by all level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    assert.equal(convertedNode.value, expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // 既に全レベルを短縮した状態であえて短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
  })
  it('should collapse by all level and expand by each one level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    assert.equal(convertedNode.value, expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    assert.equal(convertedNode.value, expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected1)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected2)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected3)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
  })
  it('should collapse by each one level and expand by all level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    assert.equal(convertedNode.value, expected4)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    assert.equal(convertedNode.value, expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected3)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected2)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected1)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // 既に全レベルを短縮した状態であえて短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
    // 全階層ラジオボタンをクリックする
    fireEvent.click(optionAllLevel)
    assert.equal(convertedNode.value, expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
  })
  it('should not expand at initial input', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // 全階層ラジオボタンをクリックする
    fireEvent.click(optionAllLevel)
    assert.equal(convertedNode.value, expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    assert.equal(convertedNode.value, expected4)
    // 全階層ラジオボタンをクリックする
    fireEvent.click(optionAllLevel)
    assert.equal(convertedNode.value, expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    assert.equal(convertedNode.value, expected0)
  })
})

describe('Copy into clipboard', () => {
  let screen: Screen
  let inputNode: FakeElement
  let collapseNode: FakeElement
  let copyButtonNode: FakeElement

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    screen = render()
    inputNode = screen.getByTestId('InputClause')
    collapseNode = screen.getByTestId('CollapseAllParentheses')
    copyButtonNode = screen.getByTestId('CopyConvertedClause')
  })


  const inputText = `（定款の記載又は記録事項に関する検査役の選任）
  第三十三条　発起人は、定款に第二十八条各号に掲げる事項についての記載又は記録があるときは、第三十条第一項の公証人の認証の後遅滞なく、当該事項を調査させるため、裁判所に対し、検査役の選任の申立てをしなければならない。
  ２　前項の申立てがあった場合には、裁判所は、これを不適法として却下する場合を除き、検査役を選任しなければならない。
  ３　裁判所は、前項の検査役を選任した場合には、成立後の株式会社が当該検査役に対して支払う報酬の額を定めることができる。
  ４　第二項の検査役は、必要な調査を行い、当該調査の結果を記載し、又は記録した書面又は電磁的記録（法務省令で定めるものに限る。）を裁判所に提供して報告をしなければならない。
  ５　裁判所は、前項の報告について、その内容を明瞭にし、又はその根拠を確認するため必要があると認めるときは、第二項の検査役に対し、更に前項の報告を求めることができる。
  ６　第二項の検査役は、第四項の報告をしたときは、発起人に対し、同項の書面の写しを交付し、又は同項の電磁的記録に記録された事項を法務省令で定める方法により提供しなければならない。
  ７　裁判所は、第四項の報告を受けた場合において、第二十八条各号に掲げる事項（第二項の検査役の調査を経ていないものを除く。）を不当と認めたときは、これを変更する決定をしなければならない。
  ８　発起人は、前項の決定により第二十八条各号に掲げる事項の全部又は一部が変更された場合には、当該決定の確定後一週間以内に限り、その設立時発行株式の引受けに係る意思表示を取り消すことができる。
  ９　前項に規定する場合には、発起人は、その全員の同意によって、第七項の決定の確定後一週間以内に限り、当該決定により変更された事項についての定めを廃止する定款の変更をすることができる。
  １０　前各項の規定は、次の各号に掲げる場合には、当該各号に定める事項については、適用しない。
  一　第二十八条第一号及び第二号の財産（以下この章において「現物出資財産等」という。）について定款に記載され、又は記録された価額の総額が五百万円を超えない場合　同条第一号及び第二号に掲げる事項
  二　現物出資財産等のうち、市場価格のある有価証券（金融商品取引法（昭和二十三年法律第二十五号）第二条第一項に規定する有価証券をいい、同条第二項の規定により有価証券とみなされる権利を含む。以下同じ。）について定款に記載され、又は記録された価額が当該有価証券の市場価格として法務省令で定める方法により算定されるものを超えない場合　当該有価証券についての第二十八条第一号又は第二号に掲げる事項
  三　現物出資財産等について定款に記載され、又は記録された価額が相当であることについて弁護士、弁護士法人、弁護士・外国法事務弁護士共同法人、公認会計士（外国公認会計士（公認会計士法（昭和二十三年法律第百三号）第十六条の二第五項に規定する外国公認会計士をいう。）を含む。以下同じ。）、監査法人、税理士又は税理士法人の証明（現物出資財産等が不動産である場合にあっては、当該証明及び不動産鑑定士の鑑定評価。以下この号において同じ。）を受けた場合　第二十八条第一号又は第二号に掲げる事項（当該証明を受けた現物出資財産等に係るものに限る。）
  １１　次に掲げる者は、前項第三号に規定する証明をすることができない。
  一　発起人
  二　第二十八条第二号の財産の譲渡人
  三　設立時取締役（第三十八条第一項に規定する設立時取締役をいう。）又は設立時監査役（同条第三項第二号に規定する設立時監査役をいう。）
  四　業務の停止の処分を受け、その停止の期間を経過しない者
  五　弁護士法人、弁護士・外国法事務弁護士共同法人、監査法人又は税理士法人であって、その社員の半数以上が第一号から第三号までに掲げる者のいずれかに該当するもの`

  const expectedInitial = `（定款の記載又は記録事項に関する検査役の選任）
  第33条　発起人は、定款に第28条各号に掲げる事項についての記載又は記録があるときは、第30条第1項の公証人の認証の後遅滞なく、当該事項を調査させるため、裁判所に対し、検査役の選任の申立てをしなければならない。
  2　前項の申立てがあった場合には、裁判所は、これを不適法として却下する場合を除き、検査役を選任しなければならない。
  3　裁判所は、前項の検査役を選任した場合には、成立後の株式会社が当該検査役に対して支払う報酬の額を定めることができる。
  4　第2項の検査役は、必要な調査を行い、当該調査の結果を記載し、又は記録した書面又は電磁的記録（法務省令で定めるものに限る。）を裁判所に提供して報告をしなければならない。
  5　裁判所は、前項の報告について、その内容を明瞭にし、又はその根拠を確認するため必要があると認めるときは、第2項の検査役に対し、更に前項の報告を求めることができる。
  6　第2項の検査役は、第4項の報告をしたときは、発起人に対し、同項の書面の写しを交付し、又は同項の電磁的記録に記録された事項を法務省令で定める方法により提供しなければならない。
  7　裁判所は、第4項の報告を受けた場合において、第28条各号に掲げる事項（第2項の検査役の調査を経ていないものを除く。）を不当と認めたときは、これを変更する決定をしなければならない。
  8　発起人は、前項の決定により第28条各号に掲げる事項の全部又は一部が変更された場合には、当該決定の確定後一週間以内に限り、その設立時発行株式の引受けに係る意思表示を取り消すことができる。
  9　前項に規定する場合には、発起人は、その全員の同意によって、第7項の決定の確定後一週間以内に限り、当該決定により変更された事項についての定めを廃止する定款の変更をすることができる。
  10　前各項の規定は、次の各号に掲げる場合には、当該各号に定める事項については、適用しない。
  一　第28条第一号及び第二号の財産（以下この章において「現物出資財産等」という。）について定款に記載され、又は記録された価額の総額が五百万円を超えない場合　同条第一号及び第二号に掲げる事項
  二　現物出資財産等のうち、市場価格のある有価証券（金融商品取引法（昭和二十三年法律第二十五号）第2条第1項に規定する有価証券をいい、同条第2項の規定により有価証券とみなされる権利を含む。以下同じ。）について定款に記載され、又は記録された価額が当該有価証券の市場価格として法務省令で定める方法により算定されるものを超えない場合　当該有価証券についての第28条第一号又は第二号に掲げる事項
  三　現物出資財産等について定款に記載され、又は記録された価額が相当であることについて弁護士、弁護士法人、弁護士・外国法事務弁護士共同法人、公認会計士（外国公認会計士（公認会計士法（昭和二十三年法律第百三号）第16条の2第5項に規定する外国公認会計士をいう。）を含む。以下同じ。）、監査法人、税理士又は税理士法人の証明（現物出資財産等が不動産である場合にあっては、当該証明及び不動産鑑定士の鑑定評価。以下この号において同じ。）を受けた場合　第28条第一号又は第二号に掲げる事項（当該証明を受けた現物出資財産等に係るものに限る。）
  11　次に掲げる者は、前項第三号に規定する証明をすることができない。
  一　発起人
  二　第28条第二号の財産の譲渡人
  三　設立時取締役（第38条第1項に規定する設立時取締役をいう。）又は設立時監査役（同条第3項第二号に規定する設立時監査役をいう。）
  四　業務の停止の処分を受け、その停止の期間を経過しない者
  五　弁護士法人、弁護士・外国法事務弁護士共同法人、監査法人又は税理士法人であって、その社員の半数以上が第一号から第三号までに掲げる者のいずれかに該当するもの`

  const expectedCollapsed = `（…）
  第33条　発起人は、定款に第28条各号に掲げる事項についての記載又は記録があるときは、第30条第1項の公証人の認証の後遅滞なく、当該事項を調査させるため、裁判所に対し、検査役の選任の申立てをしなければならない。
  2　前項の申立てがあった場合には、裁判所は、これを不適法として却下する場合を除き、検査役を選任しなければならない。
  3　裁判所は、前項の検査役を選任した場合には、成立後の株式会社が当該検査役に対して支払う報酬の額を定めることができる。
  4　第2項の検査役は、必要な調査を行い、当該調査の結果を記載し、又は記録した書面又は電磁的記録（…）を裁判所に提供して報告をしなければならない。
  5　裁判所は、前項の報告について、その内容を明瞭にし、又はその根拠を確認するため必要があると認めるときは、第2項の検査役に対し、更に前項の報告を求めることができる。
  6　第2項の検査役は、第4項の報告をしたときは、発起人に対し、同項の書面の写しを交付し、又は同項の電磁的記録に記録された事項を法務省令で定める方法により提供しなければならない。
  7　裁判所は、第4項の報告を受けた場合において、第28条各号に掲げる事項（…）を不当と認めたときは、これを変更する決定をしなければならない。
  8　発起人は、前項の決定により第28条各号に掲げる事項の全部又は一部が変更された場合には、当該決定の確定後一週間以内に限り、その設立時発行株式の引受けに係る意思表示を取り消すことができる。
  9　前項に規定する場合には、発起人は、その全員の同意によって、第7項の決定の確定後一週間以内に限り、当該決定により変更された事項についての定めを廃止する定款の変更をすることができる。
  10　前各項の規定は、次の各号に掲げる場合には、当該各号に定める事項については、適用しない。
  一　第28条第一号及び第二号の財産（…）について定款に記載され、又は記録された価額の総額が五百万円を超えない場合　同条第一号及び第二号に掲げる事項
  二　現物出資財産等のうち、市場価格のある有価証券（…）について定款に記載され、又は記録された価額が当該有価証券の市場価格として法務省令で定める方法により算定されるものを超えない場合　当該有価証券についての第28条第一号又は第二号に掲げる事項
  三　現物出資財産等について定款に記載され、又は記録された価額が相当であることについて弁護士、弁護士法人、弁護士・外国法事務弁護士共同法人、公認会計士（…）、監査法人、税理士又は税理士法人の証明（…）を受けた場合　第28条第一号又は第二号に掲げる事項（…）
  11　次に掲げる者は、前項第三号に規定する証明をすることができない。
  一　発起人
  二　第28条第二号の財産の譲渡人
  三　設立時取締役（…）又は設立時監査役（…）
  四　業務の停止の処分を受け、その停止の期間を経過しない者
  五　弁護士法人、弁護士・外国法事務弁護士共同法人、監査法人又は税理士法人であって、その社員の半数以上が第一号から第三号までに掲げる者のいずれかに該当するもの`

  it('should collapse and expand by each one level', async () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    // コピーボタンをクリック
    fireEvent.click(copyButtonNode)
    let clipboardText = await screen.clipboard.readText()
    assert.equal(clipboardText, expectedInitial)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    // コピーボタンをクリック
    fireEvent.click(copyButtonNode)
    clipboardText = await screen.clipboard.readText()
    assert.equal(clipboardText, expectedCollapsed)
  })
})
