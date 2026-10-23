// Google Analytics (gtag.js) の読み込み。
// 測定IDはビルド時に <meta name="ga-measurement-id"> へ埋め込まれる（scripts/build.ts 参照）

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

const meta = document.querySelector<HTMLMetaElement>('meta[name="ga-measurement-id"]')
const measurementId = meta?.content ?? ''

// 未設定（開発環境ではプレースホルダーのまま）の場合は読み込まない
if (measurementId !== '' && !measurementId.startsWith('%')) {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js は arguments オブジェクトそのものを期待する
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId)
}

export {}
