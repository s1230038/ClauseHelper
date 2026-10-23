# clause-helper-app

条文ビューワーのWebアプリ本体です。依存パッケージは TypeScript のみで、フレームワークは使っていません。

## 必要なもの

- Node.js 22.18 以上（テストとスクリプトは Node の型ストリッピングで `.ts` を直接実行します）

## コマンド

```bash
npm install         # TypeScript をインストール
npm run dev         # http://localhost:3000 で開発サーバーを起動（src の変更時に自動で再コンパイル）
npm run build       # dist/ にビルド（public/ のコピー + src のコンパイル）
npm start           # ビルド済みの dist/ を配信
npm run typecheck   # 型チェック
npm test            # テスト（node:test）
```

## 構成

- `public/` — HTML・CSS・favicon。ビルド時に `dist/` へコピーされます
- `src/` — TypeScript。`dist/js/` に ES モジュールとしてコンパイルされます
- `scripts/` — ビルド・開発サーバー用スクリプト
- `types/node.d.ts` — `@types/node` の代わりに、使用している Node.js API だけを宣言した型定義

## デプロイ（Vercel）

`vercel.json` で `npm run build` と出力先 `dist/` を指定しています。
Google Analytics の測定IDは、ビルド時の環境変数 `GA_MEASUREMENT_ID`（なければ `NEXT_PUBLIC_GA_ID`）から HTML に埋め込まれます。
