// ローカル用の静的ファイルサーバー。
//   node scripts/serve.ts        開発: public/ と dist/js/ を配信し、src の変更時に再コンパイル
//   node scripts/serve.ts --dist ビルド結果の dist/ を配信
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'

const appDir = join(import.meta.dirname, '..')
const port = Number(process.env.PORT ?? 3000)
const serveDist = process.argv.includes('--dist')

const contentTypes: { [ext: string]: string } = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
}

// URLのパスから配信するファイルを決める（Vercel の cleanUrls と同様に拡張子なしは .html を補う）
async function resolveFile(urlPath: string): Promise<string | undefined> {
  const root = join(appDir, serveDist || urlPath.startsWith('/js/') ? 'dist' : 'public')
  let relative = normalize(decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath))
  if (extname(relative) === '') relative += '.html'
  const path = join(root, relative)
  // ディレクトリトラバーサル対策
  if (!path.startsWith(root + sep)) return undefined
  try {
    return (await stat(path)).isFile() ? path : undefined
  } catch {
    return undefined
  }
}

// src の変更を監視して再コンパイルする。
// tsc --watch はファイルシステムによっては（WSL の /mnt/c など）変更を検知できないため、更新時刻をポーリングする
const srcDir = join(appDir, 'src')
const tscArgs = [join(appDir, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(appDir, 'tsconfig.build.json')]
let compiledMtime = -1
let compiling = false

async function latestSourceMtime(): Promise<number> {
  let latest = 0
  for (const file of await readdir(srcDir, { recursive: true })) {
    latest = Math.max(latest, (await stat(join(srcDir, file))).mtimeMs)
  }
  return latest
}

async function compileIfChanged(): Promise<void> {
  if (compiling) return
  const mtime = await latestSourceMtime()
  if (mtime === compiledMtime) return
  compiling = true
  compiledMtime = mtime
  await new Promise<void>((resolve) => {
    spawn(process.execPath, tscArgs, { stdio: 'inherit' }).on('exit', () => resolve())
  })
  console.info(`Compiled src/ into dist/js/ (${new Date().toLocaleTimeString()})`)
  compiling = false
}

if (!serveDist) {
  await compileIfChanged()
  setInterval(compileIfChanged, 1000)
}

createServer(async (req, res) => {
  const urlPath = new URL(req.url ?? '/', 'http://localhost').pathname
  const file = await resolveFile(urlPath)
  if (file === undefined) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
    return
  }
  const contentType = contentTypes[extname(file)] ?? 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' })
  res.end(await readFile(file))
}).listen(port, () => {
  console.info(`Serving ${serveDist ? 'dist/' : 'public/ + dist/js/'} at http://localhost:${port}`)
})
