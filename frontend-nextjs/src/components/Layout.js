import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const isNewsPage = router.pathname === '/news';
  const isLandingPage = router.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      {!isNewsPage && !isLandingPage && <Header />}
      
      {/* Main content with padding for fixed header */}
      <main className="flex-grow">
        {children}
      </main>
      
      {!isNewsPage && !isLandingPage && <Footer />}
    </div>
  );
}