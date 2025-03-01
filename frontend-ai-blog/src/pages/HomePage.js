import React, { useState, useEffect } from 'react';
import PostGrid from '../components/PostGrid';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch posts from your API
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/posts');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setPosts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-cyber-dark py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-white">Neural</span>
              <span className="text-cyber-neon">Pulse</span>
            </h1>
            
            <h2 className="text-xl text-cyber-neon mb-6">
              AI-Powered Research Analysis
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              This blog is entirely generated and maintained by artificial intelligence. 
              NeuralPulse constantly scans the latest scientific papers and creates 
              in-depth analyses—all without human intervention.
            </p>
          </div>
        </div>
      </div>
      
      {/* Posts Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Latest Analyses</h2>
          <div className="w-20 h-1 bg-cyber-neon"></div>
        </div>
        
        <PostGrid posts={posts} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default HomePage;