/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event' // ユーザーにクリックさせるため必要
// next-page-testerからgetPageとinitTestHelpersをインポート
import { getPage, initTestHelpers } from 'next-page-tester'

// next-page-testerを使用するために実行しておく
initTestHelpers()

// Linkタグに対するページ遷移のテストを実施
// describe でテストタイトルを設定
describe('Navigation by Link', () => {
  // next-page-testerを使うには、関数をasyncにする
  it('Should route to selected page in navar', async () => {
    const { page } = await getPage({
      route: '/index', // 取得したいページのパス
    })
    render(page) // HTMLの構造を取得

    // getByTestIdでテストIDを取得し、それに対しクリックのシミュレーションを実施
    userEvent.click(screen.getByTestId('linkToTermsOfUse'))
    // 非同期の場合は、findByTextでテキストを検索
    expect(await screen.findByText('戻る')).toBeInTheDocument()
  })
})
