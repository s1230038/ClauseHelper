import Link from 'next/link'

function TermsOfUse() {
  return (
    <div>
      <h1>免責事項</h1>
      <p>
        本Webアプリケーションを利用した結果生じるいかなる損害についても、作者は責任を負いかねます。ユーザー自身の責任のもとでの利用をお願いいたします。
      </p>
      <Link href="/">戻る</Link>
    </div>
  )
}

export default TermsOfUse
