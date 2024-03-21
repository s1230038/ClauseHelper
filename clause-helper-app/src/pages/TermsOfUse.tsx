import Link from 'next/link'
import styles from '../styles/Home.module.css'

function TermsOfUse() {
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>免責事項</h1>
      <p>
        本Webアプリケーションを利用した結果生じるいかなる損害についても、作者は責任を負いかねます。ユーザー自身の責任のもとでの利用をお願いいたします。
      </p>
      <Link href="/">戻る</Link>
    </div>
  )
}

export default TermsOfUse
