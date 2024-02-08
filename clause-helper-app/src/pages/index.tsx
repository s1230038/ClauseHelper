import { kanji2number, findKanjiNumbers } from '@geolonia/japanese-numeral'
import { useState, useEffect } from 'react'

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
