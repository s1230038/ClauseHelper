// public/ を dist/ にコピーし、HTML中の %GA_MEASUREMENT_ID% を環境変数の値に置き換える。
// TypeScript のコンパイル（src → dist/js）は package.json の build スクリプトでこの後に実行する
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const appDir = join(import.meta.dirname, '..')
const publicDir = join(appDir, 'public')
const distDir = join(appDir, 'dist')

// Vercel に設定済みの NEXT_PUBLIC_GA_ID も引き続き使えるようにする
const gaMeasurementId = process.env.GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID ?? ''

await rm(distDir, { recursive: true, force: true })
await cp(publicDir, distDir, { recursive: true })

for (const file of await readdir(distDir, { recursive: true })) {
  if (file.endsWith('.html')) {
    const path = join(distDir, file)
    const html = await readFile(path, 'utf-8')
    await writeFile(path, html.replaceAll('%GA_MEASUREMENT_ID%', gaMeasurementId))
  }
}
console.info(`Copied public/ into dist/ (GA measurement ID: ${gaMeasurementId || 'none'})`)
