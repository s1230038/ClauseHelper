# 構成簡素化の変更内容まとめ

`clause-helper-app` を、依存パッケージが **TypeScript のみ** の構成に書き換えました。
アプリの機能（条・項の漢数字変換、丸括弧の短縮・展開、コピー、免責事項ページ、Google Analytics、Vercel Speed Insights）は維持しています。

## 1. 目的と結果

| 項目 | 変更前 | 変更後 |
|---|---|---|
| 依存パッケージ | dependencies 15個 + devDependencies 37個 | `typescript`（^7.0.2）のみ |
| フレームワーク | Next.js 14 + React 18 | なし（素の HTML + TypeScript） |
| テスト | Jest + Testing Library（jsdom） | Node 標準の `node:test` + `node:assert/strict` |
| ビルド | `next build` | `public/` のコピー + `tsc` で `src/` → `dist/js/` |
| 実行環境 | Node（バージョン指定なし） | Node 22.18 以上（`engines` で指定） |

`package-lock.json` には `@typescript/typescript-<OS>-<CPU>` が20件ほど載っていますが、これは TypeScript 7 本体が持つ OS 別ネイティブバイナリ（optional dependency）で、実際にインストールされるのは自分の環境向けの1つだけです。

## 2. 置き換えの対応表

| 変更前 | 変更後 | 補足 |
|---|---|---|
| `src/pages/index.tsx`, `src/components/*.tsx` | `public/index.html` + `src/main.ts` + `src/app/ClauseViewer.ts` | React の状態管理を `ClauseViewerState` クラスに移した |
| `src/pages/TermsOfUse.tsx` | `public/TermsOfUse.html` | `/TermsOfUse` の URL は Vercel の `cleanUrls` で維持 |
| `src/pages/_app.tsx`, `src/lib/gtag.js` | `src/analytics.ts` | gtag.js を動的に読み込む |
| `src/pages/_document.tsx` | `public/*.html` の `<head>` | Google サイト確認用の meta タグを移した。styled-components 用の SSR 処理は不要になったため削除 |
| `@vercel/speed-insights` | `<script defer src="/_vercel/speed-insights/script.js">` | Vercel 公式の、フレームワークを使わない場合の読み込み方法 |
| `@geolonia/japanese-numeral` | `src/logic/JapaneseNumeral.ts` | `kanji2number` / `findKanjiNumbers` を自作 |
| `src/styles/globals.css`, `Home.module.css` | `public/styles.css` | CSS Modules のクラス名をそのまま普通のクラスにした。未使用の CSS 変数は削除 |
| `src/components/Types.tsx` | `src/logic/Types.ts` | React 依存の型（`OnChangeInput` など）を削除し、`RangeOption` 型を追加 |
| `@types/node` | `types/node.d.ts` | テスト・スクリプトで使う Node API だけを手書きで宣言 |
| `jest.config.js`, `jest.setup.js` | `package.json` の `test` スクリプト | `node --test "src/**/*.spec.ts"` |
| `next.config.js` | `vercel.json`, `tsconfig.build.json` | — |

## 3. 削除したもの

- **Next.js 関連:** `next.config.js`, `next-env.d.ts`, `src/pages/`, `.next/`
- **React コンポーネント:** `src/components/` 一式
- **Storybook:** `.storybook/`, `src/stories/`（初期生成されたサンプルのみだったもの）
- **Lint・フォーマッタ:** `.eslintrc.json`, `.prettierrc.json`, `.stylelintrc.json`, `.stylelintignore`, `.secretlintrc.json`
- **Jest:** `jest.config.js`, `jest.setup.js`
- **未使用の静的ファイル:** `public/next.svg`, `public/vercel.svg`
- **デバッグ出力:** `Kanji2Num.ts` 内の `console.info(repTable)`（入力のたびに置換表をログに出していたため）

## 4. 新しいディレクトリ構成

```
clause-helper-app/
├── package.json          # devDependencies は typescript のみ。"type": "module"
├── tsconfig.json         # 型チェック用（src・テスト・scripts すべて。出力なし）
├── tsconfig.build.json   # ブラウザ向けビルド（src → dist/js、spec を除外）
├── vercel.json           # Vercel のビルド設定
├── public/               # そのまま dist/ にコピーされる静的ファイル
│   ├── index.html
│   ├── TermsOfUse.html
│   ├── styles.css
│   └── favicon.ico
├── src/
│   ├── main.ts           # index.html の要素を取得して mountClauseViewer に渡す
│   ├── analytics.ts      # Google Analytics の読み込み
│   ├── app/
│   │   ├── ClauseViewer.ts       # 画面の状態と操作、イベントの登録
│   │   └── ClauseViewer.spec.ts  # 画面操作のテスト（旧 ClauseViewerApp.spec.tsx）
│   └── logic/
│       ├── Kanji2Num.ts          # 条・項・枝番号の漢数字 → 算用数字
│       ├── CollapseExpand.ts     # 丸括弧の短縮・展開
│       ├── JapaneseNumeral.ts    # 漢数字 ⇔ 数値（新規）
│       ├── JapaneseNumeral.spec.ts
│       └── Types.ts
├── scripts/
│   ├── build.ts          # public/ を dist/ にコピーし、GA 測定IDを埋め込む
│   └── serve.ts          # ローカル用の静的ファイルサーバー
└── types/
    └── node.d.ts         # Node 標準API の最小限の型宣言
```

## 5. 設計上のポイント

### 5.1 画面の部品を最小限のインターフェースで受け取る

`mountClauseViewer` は DOM の型（`HTMLTextAreaElement` など）を直接使わず、必要なプロパティだけを持つ型で画面の部品を受け取ります。

```ts
type Listenable = { addEventListener(type: string, listener: () => void): void }
export type TextElement = Listenable & { value: string }
export type RadioElement = Listenable & { value: string; checked: boolean }
```

- ブラウザでは `src/main.ts` が `document.getElementById` で取得した本物の要素を渡します。
- テストでは偽物の要素（`FakeElement` / `FakeRadio`）を渡します。jsdom のような DOM ライブラリがなくても、入力・クリック・ラジオボタンの切り替えまで含めて検証できます。

### 5.2 状態とロジックの分離

React の `useState` で持っていた `originalText` / `convertedText` / `selectedRange` は、`ClauseViewerState` クラスのフィールドになりました。
短縮・展開の処理（`collapse()` / `expand()`）は、旧 `ManipulateParentheses.tsx` のボタン処理をそのまま移したものです。操作のあとに `render()` で画面に反映します。

### 5.3 漢数字変換の自作（`JapaneseNumeral.ts`）

条文の正規表現が対象とする文字（`一〜九`, `十`, `百`, `千`）だけを扱います。

- `kanji2number('二百六十四')` → `264`、`kanji2number('十三')` → `13`。単位の前に数字がなければ 1 とみなします。
- 対象外の文字（例: `万`）があれば例外を投げます。正規表現で対象外の文字は除かれるため、通常は発生しません。
- 変換結果が以前と同じであることは、既存の変換テスト（`第三十三条の十三` → `第33条の13` など）で確認しました。

### 5.4 TypeScript を Node でそのまま実行する

- テストと `scripts/*.ts` は、Node 22.18 以降の型ストリッピング機能で `.ts` のまま直接実行します。テスト用のコンパイルはしません。
- そのため `erasableSyntaxOnly` を有効にしています。`enum`、`namespace`、コンストラクタ引数でのプロパティ宣言は使えません。
- 相対 import は `.ts` 拡張子付きで書きます（例: `'./Kanji2Num.ts'`）。ブラウザ向けビルドでは `rewriteRelativeImportExtensions` が `.js` に書き換えます。
- `verbatimModuleSyntax` を有効にしているため、型だけの import は `import type` で書きます。

## 6. テスト

### 6.1 Jest から node:test への移行

| Jest / Testing Library | node:test（移行後） |
|---|---|
| `render(<ClauseViewer />)` | `render()`（spec 内で偽物の部品を組み立てて `mountClauseViewer` に渡す） |
| `screen.getByTestId('InputClause')` | `screen.getByTestId('InputClause')`（同じ名前で使えるようにした） |
| `screen.getByLabelText('全階層')` | 同上 |
| `fireEvent.change(el, { target: { value } })` | 同上（値を設定して `input` イベントを発火） |
| `fireEvent.click(el)` / `userEvent.click(el)` | `fireEvent.click(el)`（ラジオボタンは同じグループ内で選択を切り替え、選択が変わったときだけ `change` を発火） |
| `navigator.clipboard.readText()` | `screen.clipboard.readText()`（偽物のクリップボード） |
| `expect(x).toHaveValue(v)` | `assert.equal(x.value, v)` |
| `expect(x).toBe(v)` / `toEqual(v)` | `assert.equal(x, v)` |
| `afterEach(() => unmount())` | 削除（テストごとに新しい偽物を作るため不要） |

期待値の条文テキストは一切変更していません。

### 6.2 テストの一覧（18件すべて成功）

- Input Clause（4件）: 初期表示が空であること、漢数字変換（通常・トリッキーな枝番号・項と号の混在）
- Parentheses Change Range（3件）: ラジオボタンの初期状態と切り替え
- Function test: collapse()（2件）
- Collapse and expand parenthesis blocks（5件）: 1階層ずつ・全階層の短縮と展開の組み合わせ
- Copy into clipboard（1件）
- **新規** Function test: kanji2number()（2件）、findKanjiNumbers()（1件）

### 6.3 注意点

テスト用の偽物の画面は `public/index.html` と同じ構成になるよう手で合わせています。要素の id や `main.ts` での結び付けを変えたときは、spec 内の `render()` も合わせて直す必要があります。実際の HTML を読み込んで確かめるテストはありません。

## 7. ビルド・開発サーバー

### npm スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | `http://localhost:3000` で開発サーバーを起動。`public/` と `dist/js/` を配信し、`src/` を変更すると自動で再コンパイル |
| `npm run build` | `dist/` を作り直す（`scripts/build.ts` で `public/` をコピー → `tsc` で `src/` をコンパイル） |
| `npm start` | ビルド済みの `dist/` を配信 |
| `npm run typecheck` | 型チェック（src・テスト・scripts） |
| `npm test` | テスト実行 |

### 開発サーバー（`scripts/serve.ts`）

- 拡張子なしの URL には `.html` を補います（`/TermsOfUse` → `TermsOfUse.html`）。Vercel の `cleanUrls` と同じ動きです。
- `..` を使って公開ディレクトリの外のファイルを読む要求は 404 を返します。
- WSL の `/mnt/c` 上では TypeScript 7 の `tsc --watch` が変更を検知できなかった（`fanotify_mark ... operation not supported`）ため、`src/` の更新時刻を1秒ごとに確認して再コンパイルする方式にしています。
- `PORT` 環境変数でポートを変更できます。

## 8. デプロイ（Vercel）

`vercel.json` の内容:

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true
}
```

- **Google Analytics:** HTML の `<meta name="ga-measurement-id" content="%GA_MEASUREMENT_ID%">` が、ビルド時に環境変数 `GA_MEASUREMENT_ID`（なければ従来の `NEXT_PUBLIC_GA_ID`）の値に置き換えられます。値がない場合（ローカル開発時など）は gtag.js を読み込みません。Vercel の既存の環境変数設定はそのまま使えます。
- **Speed Insights:** `/_vercel/speed-insights/script.js` は Vercel 上でだけ使えます。ローカルでは 404 になりますが、動作に影響はありません。
- **要確認:** Vercel のプロジェクト設定で Framework Preset が Next.js のままになっている場合は、`vercel.json` の `"framework": null` が優先されるはずですが、念のため設定画面を確認してください。

## 9. 周辺ファイルの変更

| ファイル | 変更内容 |
|---|---|
| `githooks/pre-commit.sh` | secretlint・ESLint・stylelint を削除し、`npm run typecheck` を実行。失敗したらコミットを中止 |
| `githooks/pre-push.sh` | `npm ci` → `npm test`。テストが失敗したらプッシュを中止（以前は失敗しても止まらなかった） |
| `.vscode/settings.json` | ESLint・Prettier の設定を削除。プロジェクトの TypeScript を使う設定（`typescript.tsdk`）を追加 |
| `.vscode/launch.json` | Next.js のサーバーデバッグ設定を、テストのデバッグ設定に置き換えた |
| `clause-helper-app/.gitignore` | Next.js 用の項目を削除し、`/dist` を追加 |
| `clause-helper-app/README.md` | Next.js の初期 README から、新しい構成の説明（日本語）に書き換えた |
| `CLAUDE.md` | 新しい構成に合わせて更新 |

## 10. 失われた機能・既知の制約

- **Lint・自動整形がなくなった:** ESLint（import 順や関数の行数制限などのルール）、Prettier、stylelint によるチェックはなくなりました。品質チェックは TypeScript の型チェック（`strict`）だけです。
- **秘密情報のチェックがなくなった:** secretlint によるコミット前のチェックはなくなりました。
- **本番ビルドでの `data-testid` 削除は不要になった:** テストが `data-testid` 属性を使わなくなったため、HTML に `data-testid` は付けていません。
- **実ブラウザでの確認は未実施:** ビルド・配信・テストは確認済みですが、ブラウザで実際に画面を操作する確認はしていません。デプロイ前に `npm run build && npm start` で一度動作を確認してください。
- **Node のバージョン:** Node 22.18 未満ではテストとスクリプトが動きません（`.ts` を直接実行できないため）。
