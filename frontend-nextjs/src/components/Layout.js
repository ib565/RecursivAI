import Header from './Header';
import Footer from './Footer';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const isNewsPage = router.pathname === '/news';

  return (
    <div className="flex flex-col min-h-screen">
      {!isNewsPage && <Header />}
      
      {/* Main content with padding for fixed header */}
      <main className="flex-grow">
        {children}
      </main>
      
      {!isNewsPage && <Footer />}
    </div>
  );
}