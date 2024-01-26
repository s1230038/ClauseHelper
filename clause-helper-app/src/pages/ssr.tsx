import { GetServerSideProps, NextPage } from "next"
import Head from "next/head"

type SSRProps = {
    message: string
}

const SSR: NextPage<SSRProps> = (props) => {
    const {message} = props
    
    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon" />
            </Head>
            <main>
                <p>
                    このページはサーバーサイドレンダリングによってアクセス時にサーバーで描画されたページです。
                </p>
                <p>{message}</p>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<SSRProps> = async (context) => {
    const timestamp = new Date().toLocaleString()
    const message = `${timestamp} にgetServerSidePropsが実行されました`
    // $ npm run build 実行時のログに出力される（標準エラー出力）
    console.log(message)

    return {
        props: {
            message,
        },
    }
}

export default SSR