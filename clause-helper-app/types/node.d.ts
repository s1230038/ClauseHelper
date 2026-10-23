// @types/node を依存に加えないため、このプロジェクトで使う Node.js 標準APIだけを宣言する

declare var process: {
  argv: string[]
  env: { [key: string]: string | undefined }
  execPath: string
}

interface ImportMeta {
  dirname: string
}

declare module 'node:test' {
  type Fn = () => void | Promise<void>
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: Fn): void
  export function beforeEach(fn: Fn): void
  export function afterEach(fn: Fn): void
}

declare module 'node:assert/strict' {
  const assert: {
    equal<T>(actual: unknown, expected: T, message?: string): asserts actual is T
    deepEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T
    throws(fn: () => unknown, message?: string): void
  }
  export default assert
}

declare module 'node:fs/promises' {
  export function cp(src: string, dest: string, options?: { recursive?: boolean }): Promise<void>
  export function rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>
  export function readdir(path: string, options: { recursive: true }): Promise<string[]>
  export function readFile(path: string): Promise<Uint8Array>
  export function readFile(path: string, encoding: 'utf-8'): Promise<string>
  export function writeFile(path: string, data: string): Promise<void>
  export function stat(path: string): Promise<{ isFile(): boolean; mtimeMs: number }>
}

declare module 'node:path' {
  export function join(...paths: string[]): string
  export function resolve(...paths: string[]): string
  export function extname(path: string): string
  export function normalize(path: string): string
  export const sep: string
}

declare module 'node:http' {
  export type IncomingMessage = { url?: string; method?: string }
  export type ServerResponse = {
    writeHead(status: number, headers?: { [name: string]: string }): void
    end(body?: string | Uint8Array): void
  }
  export function createServer(
    listener: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>,
  ): { listen(port: number, callback: () => void): void }
}

declare module 'node:child_process' {
  export function spawn(
    command: string,
    args: string[],
    options?: { stdio?: 'inherit' },
  ): { on(event: 'exit', listener: () => void): void }
}
