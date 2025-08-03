import Layout from '../components/Layout';
import '@/styles/globals.css';
import { 
  Share_Tech_Mono, 
  Chakra_Petch, 
  Playfair_Display, 
  Merriweather, 
  Source_Serif_4 
} from 'next/font/google';

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-share-tech-mono',
});

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-chakra-petch',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair-display',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-merriweather',
});

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif-4',
});

function MyApp({ Component, pageProps }) {
  return (
    <div
      className={`${shareTechMono.variable} ${chakraPetch.variable} ${playfairDisplay.variable} ${merriweather.variable} ${sourceSerif4.variable}`}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}

export default MyApp;