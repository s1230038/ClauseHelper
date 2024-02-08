function ExpandAllParentheses() {
  return (
    <>
      <button id="ExpandAllParentheses">丸括弧を展開</button>
    </>
  )
}

function CollapseAllParentheses() {
  return (
    <>
      <button id="CollapseAllParentheses">丸括弧を短縮</button>
    </>
  )
}

function ParenthesesChangeRange() {
  return (
    <>
      <p>丸括弧の展開／縮小の範囲</p>
      <label>
        <input type="radio" value="allLevels" />
        全階層
      </label>

      <label>
        <input type="radio" value="oneLevel" />
        １階層
      </label>
    </>
  )
}

function ParenthesesManipulator() {
  return (
    <>
      <ParenthesesChangeRange />
      <CollapseAllParentheses />
      <ExpandAllParentheses />
    </>
  )
}

function CopyConvertedClause() {
  return (
    <>
      <button id="CopyConvertedClause">コピー</button>
    </>
  )
}

function Manipulator() {
  return (
    <>
      <CopyConvertedClause />
      <ParenthesesManipulator />
    </>
  )
}

function ConvertedClause({ convertedText }: { convertedText: string }) {
  return (
    <>
      <textarea id="ConvertedClause" value={convertedText} readOnly />
    </>
  )
}

function InputClause({ originalText }: { originalText: string }) {
  return (
    <>
      <textarea
        id="InputClause"
        placeholder="法律の条文を入力"
        value={originalText}
      />
    </>
  )
}

// dummy data
const DUMMY_ORIGINAL_TEXT =
  '第十九条の三　法第百三条の二第五項第二号（法第百三条の三第二項及び第百六条の九において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。'

const DUMMY_CONVERTED_TEXT =
  '第19条の三　法第103条の二第5項第二号（法第103条の三第2項及び第106条の九において準用する場合を含む。）に規定する政令で定める特別の関係にある者は、次に掲げる関係にある者（特定株主を除く。）とする。'

function ClauseViewHelper() {
  const originalText: string = DUMMY_ORIGINAL_TEXT
  const convertedText: string = DUMMY_CONVERTED_TEXT
  return (
    <>
      <InputClause originalText={originalText} />
      <ConvertedClause convertedText={convertedText} />
      <Manipulator />
    </>
  )
}

function App() {
  return (
    <>
      <ClauseViewHelper />
    </>
  )
}

export default App
