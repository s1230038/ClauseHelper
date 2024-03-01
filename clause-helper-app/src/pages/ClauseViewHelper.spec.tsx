/* eslint-disable max-lines-per-function */
/* eslint-disable no-irregular-whitespace */
import { render, screen, RenderResult, fireEvent } from '@testing-library/react'
import { ClauseViewHelper, getParenthesisCorrespondence, collapse } from './ClauseViewHelper'

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

  // 条文の漢数字が算用数字に変換されていることをテスト（通常）
  it('should convert Kansuji clause into numerical one as normal case', () => {
    // TestIdがInputClauseであるコンポーネントに対応するinputの要素を取得する
    const inputNode: HTMLInputElement = screen.getByTestId('InputClause')
    const convertedNode: HTMLInputElement = screen.getByTestId('ConvertedClause')

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

  // 条文の漢数字が算用数字に変換されていることをテスト（トリッキーな枝番号。「十三」が「10三」にはならないか）
  it('should convert Kansuji clause into numerical one as tricky branch', () => {
    // TestIdがInputClauseであるコンポーネントに対応するinputの要素を取得する
    const inputNode: HTMLInputElement = screen.getByTestId('InputClause')
    const convertedNode: HTMLInputElement = screen.getByTestId('ConvertedClause')

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
    expect(convertedNode).toHaveValue(convertedText)
  })

  // 条文の漢数字が算用数字に変換されていることをテスト（項と号の混在）
  it('should convert Kansuji clause into numerical one as mixed Kou and Gou', () => {
    // TestIdがInputClauseであるコンポーネントに対応するinputの要素を取得する
    const inputNode: HTMLInputElement = screen.getByTestId('InputClause')
    const convertedNode: HTMLInputElement = screen.getByTestId('ConvertedClause')

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
    expect(convertedNode).toHaveValue(convertedText)
  })
})

describe('Parentheses Change Range', () => {
  let renderResult: RenderResult

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    renderResult = render(<ClauseViewHelper />)
  })

  // テストケース実行後に描画していたコンポーネントを開放する
  afterEach(() => {
    renderResult.unmount()
  })

  // 初期描画時
  it('should be selected in the radio buttons on initial render', () => {
    const optionAllLevel: HTMLInputElement = screen.getByLabelText('全階層')
    const optionOneLevel: HTMLInputElement = screen.getByLabelText('１階層')

    expect(optionAllLevel.checked).toBe(true)
    expect(optionOneLevel.checked).toBe(false)
  })

  // クリックによる変更
  it('should be changed when clicking radio button', () => {
    const optionAllLevel: HTMLInputElement = screen.getByLabelText('全階層')
    const optionOneLevel: HTMLInputElement = screen.getByLabelText('１階層')

    // ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)

    expect(optionAllLevel.checked).toBe(false)
    expect(optionOneLevel.checked).toBe(true)
  })

  // クリックによる変更（元に戻る）
  it('should be reverted when clicking twice', () => {
    const optionAllLevel: HTMLInputElement = screen.getByLabelText('全階層')
    const optionOneLevel: HTMLInputElement = screen.getByLabelText('１階層')

    // ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    fireEvent.click(optionAllLevel)

    expect(optionAllLevel.checked).toBe(true)
    expect(optionOneLevel.checked).toBe(false)
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
    expect(result).toEqual(expected0)

    result = collapse(inputText, 1, pcList)
    expect(result).toEqual(expected1)

    result = collapse(inputText, 2, pcList)
    expect(result).toEqual(expected2)

    result = collapse(inputText, 3, pcList)
    expect(result).toEqual(expected3)

    // abnormal case
    result = collapse(inputText, 4, pcList) // level exceeds the existing
    expect(result).toEqual(inputText)

    result = collapse(inputText, 0, []) // pcList is "undefined"
    expect(result).toEqual(inputText)
  })

  it('should replace tricky parenthesis blocks', () => {
    const inputText = `２　前項の規定による特別取締役による議決の定めがある場合には、特別取締役以外の取締役は、第三百六十二条第四項第一号及び第二号又は第三百九十九条の十三第四項第一号及び第二号に掲げる事項の決定をする取締役会に出席することを要しない。この場合における第三百六十六条第一項本文及び第三百六十八条の規定の適用については、第三百六十六条第一項本文中「各取締役」とあるのは「各特別取締役（第三百七十三条第一項に規定する特別取締役をいう。第三百六十八条において同じ。）」と、第三百六十八条第一項中「定款」とあるのは「取締役会」と、「各取締役」とあるのは「各特別取締役」と、同条第二項中「取締役（」とあるのは「特別取締役（」と、「取締役及び」とあるのは「特別取締役及び」とする。`
    const expected0 = `２　前項の規定による特別取締役による議決の定めがある場合には、特別取締役以外の取締役は、第三百六十二条第四項第一号及び第二号又は第三百九十九条の十三第四項第一号及び第二号に掲げる事項の決定をする取締役会に出席することを要しない。この場合における第三百六十六条第一項本文及び第三百六十八条の規定の適用については、第三百六十六条第一項本文中「各取締役」とあるのは「各特別取締役（…）」と、第三百六十八条第一項中「定款」とあるのは「取締役会」と、「各取締役」とあるのは「各特別取締役」と、同条第二項中「取締役（」とあるのは「特別取締役（」と、「取締役及び」とあるのは「特別取締役及び」とする。`

    const pcList = getParenthesisCorrespondence(inputText)
    const result = collapse(inputText, 0, pcList)
    expect(result).toEqual(expected0)
  })
})

describe('Collapse and expand parenthesis blocks', () => {
  let renderResult: RenderResult
  let inputNode: HTMLInputElement
  let convertedNode: HTMLInputElement
  let optionAllLevel: HTMLInputElement
  let optionOneLevel: HTMLInputElement
  let expandNode: HTMLInputElement
  let collapseNode: HTMLInputElement

  // それぞれのテストケース前にコンポーネントを描画し、renderResultにセットする
  beforeEach(() => {
    renderResult = render(<ClauseViewHelper />)
    inputNode = screen.getByTestId('InputClause')
    convertedNode = screen.getByTestId('ConvertedClause')
    optionAllLevel = screen.getByLabelText('全階層')
    optionOneLevel = screen.getByLabelText('１階層')
    expandNode = screen.getByTestId('ExpandAllParentheses')
    collapseNode = screen.getByTestId('CollapseAllParentheses')
  })

  // テストケース実行後に描画していたコンポーネントを開放する
  afterEach(() => {
    renderResult.unmount()
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
    expect(convertedNode).toHaveValue(expected4)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    expect(convertedNode).toHaveValue(expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected3)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected2)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected1)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // 既に全レベルを短縮した状態であえて短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected1)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected2)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected3)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
  })
  it('should collapse and expand by all level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    expect(convertedNode).toHaveValue(expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // 既に全レベルを短縮した状態であえて短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
  })
  it('should collapse by all level and expand by each one level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    expect(convertedNode).toHaveValue(expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    expect(convertedNode).toHaveValue(expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected1)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected2)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected3)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
  })
  it('should collapse by each one level and expand by all level', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    expect(convertedNode).toHaveValue(expected4)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    expect(convertedNode).toHaveValue(expected4)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected3)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected2)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected1)
    // 短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // 既に全レベルを短縮した状態であえて短縮ボタンをクリック
    fireEvent.click(collapseNode)
    expect(convertedNode).toHaveValue(expected0)
    // 全階層ラジオボタンをクリックする
    fireEvent.click(optionAllLevel)
    expect(convertedNode).toHaveValue(expected0)
    // 展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
  })
  it('should not expand at initial input', () => {
    // テキスト貼り付け直後
    fireEvent.change(inputNode, { target: { value: inputText } })
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
    // １階層ラジオボタンをクリックする
    fireEvent.click(optionOneLevel)
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
    // 全階層ラジオボタンをクリックする
    fireEvent.click(optionAllLevel)
    expect(convertedNode).toHaveValue(expected4)
    // 既に全レベルを展開した状態で、あえて展開ボタンをクリック
    fireEvent.click(expandNode)
    expect(convertedNode).toHaveValue(expected4)
  })
})
