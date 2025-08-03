import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Viewport and basic meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="AI, artificial intelligence, deep learning, machine learning, neural networks, research, blog, tech, technology, innovation, breakthroughs, insights, news, updates, LLMs, GenAI" />
        
        {/* PWA and favicon */}
        <link rel="icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4LBZ46K2HC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4LBZ46K2HC');
          `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}