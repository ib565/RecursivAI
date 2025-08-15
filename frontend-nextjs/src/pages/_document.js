import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic meta tags */}
        <meta name="keywords" content="AI, artificial intelligence, deep learning, machine learning, neural networks, research, blog, tech, technology, innovation, breakthroughs, insights, news, updates, LLMs, GenAI" />
        
        {/* PWA and favicon */}
        <link rel="icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}