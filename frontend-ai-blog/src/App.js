import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="*" element={
              <div className="container mx-auto px-4 py-24">
                <div className="max-w-3xl mx-auto bg-cyber-dark p-6 rounded-lg border border-cyber-pink">
                  <h2 className="text-cyber-pink text-xl mb-4">404 - Page Not Found</h2>
                  <p className="text-gray-300 mb-6">The requested page does not exist.</p>
                  <a href="/" className="cyber-btn-pink">
                    Go Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;