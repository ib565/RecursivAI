import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import './index.css'; // Make sure to remove App.css import if it exists

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-cyber-black">
        <Header />
        
        {/* Main content with padding for fixed header */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="*" element={
              <div className="container mx-auto px-4 py-24">
                <div className="max-w-3xl mx-auto bg-cyber-dark p-6 rounded-lg border border-cyber-pink relative">
                  <div className="absolute -top-10 right-5 font-cyber text-6xl text-cyber-pink opacity-20 neon-text-pink">
                    404
                  </div>
                  
                  <h2 className="text-cyber-pink text-xl mb-4 font-cyber neon-text-pink">
                    Page Not Found
                  </h2>
                  
                  <p className="text-gray-300 mb-6 font-body">
                    We couldn't find the page you're looking for.
                  </p>
                  
                  <a href="/" className="cyber-btn-pink inline-block">
                    Return to Home
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