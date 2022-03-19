import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)

        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <meta charSet="UTF-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700&family=Rubik:wght@400;600&display=swap" rel="stylesheet" />

                    <link rel="stylesheet" href="/assets/plugins/fontawesome/css/fontawesome.min.css" />
                    <link rel="stylesheet" href="/assets/plugins/fontawesome/css/light.min.css" />
                    <link rel="stylesheet" href="/assets/plugins/fontawesome/css/brands.min.css" />

                    <link rel="stylesheet" href="/assets/plugins/bootstrap/bootstrap.min.css" />
                    <script src="/assets/plugins/bootstrap/bootstrap.bundle.min.js"></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument