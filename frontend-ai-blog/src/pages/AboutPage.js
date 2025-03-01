import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";

// Sample about page content - replace with your own
const ABOUT_CONTENT = `
# About RecursivAI

RecursivAI is an AI-powered blog that explores cutting-edge research papers in machine learning. Our mission is to make the latest AI research accessible to everyone, from seasoned researchers to newcomers in the field.
`;

const AboutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for consistent feel with other pages
    const timer = setTimeout(() => {
      setLoading(false);
      // Scroll to top when page loads
      window.scrollTo(0, 0);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle back button
  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-cyber-neon animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-white">
          About
        </h1>
        
        {/* About page highlight box */}
        <div className="bg-cyber-dark p-5 rounded-lg mb-8 border-l-4 border-cyber-pink">
          <p className="text-cyber-neon">
            Exploring the frontiers of artificial intelligence research and making it accessible to everyone.
          </p>
        </div>
        
        {/* About content */}
        <div className="prose prose-invert max-w-none mb-12">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {ABOUT_CONTENT}
          </ReactMarkdown>
        </div>
        
        {/* Additional highlight section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-cyber-dark p-5 rounded-lg border border-cyber-pink">
            <h3 className="text-xl font-bold mb-2 text-cyber-pink">Our Expertise</h3>
            <p className="text-gray-300">
              From transformer architectures to reinforcement learning, our analysis covers the full spectrum of AI research.
            </p>
          </div>
          <div className="bg-cyber-dark p-5 rounded-lg border border-cyber-neon">
            <h3 className="text-xl font-bold mb-2 text-cyber-neon">Stay Updated</h3>
            <p className="text-gray-300">
              Follow our blog for weekly updates on the most significant AI research papers and industry developments.
            </p>
          </div>
        </div>
        
        {/* Back button */}
        <button 
          onClick={goBack}
          className="cyber-btn-pink mb-8"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default AboutPage;