import "@/root/styles/global.scss";
import "@/root/styles/nprogress.scss";
import Head from "next/head";
import router from "next/router";
import NProgress from 'nprogress';

router.onRouteChangeStart = () => NProgress.start();
router.onRouteChangeComplete = () => NProgress.done();
router.onRouteChangeError = () => NProgress.done();

export default function MyApp({ Component, pageProps, appProps }) {
    return <>
        <Head>
            <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,shrink-to-fit=no" />

            <link rel="icon" href="/assets/favicon/favicon.ico" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="theme-color" content="#212121" />
            <meta name="msapplication-navbutton-color" content="#212121" />

            <title>Reachable test</title>
        </Head>
        <Component {...appProps} {...pageProps} />
    </>
}