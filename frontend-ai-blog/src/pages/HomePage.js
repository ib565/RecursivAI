import React, { useState, useEffect } from 'react';
import PostGrid from '../components/PostGrid';
import { getAllPosts } from '../utils/apiService';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch posts from the API service
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Only fetch published posts, with a reasonable limit
        const data = await getAllPosts({ 
          // status: 'published',
          limit: 20,
          offset: 0
        });
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
      {/* Enhanced Hero Section */}
      <div className="relative bg-cyber-black py-16 overflow-hidden">
        {/* Background grid/circuit pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: 'radial-gradient(#00ffff 1px, transparent 2px), radial-gradient(#ff00ff 1px, transparent 2px)',
               backgroundSize: '50px 50px, 30px 30px',
               backgroundPosition: '0 0, 25px 25px'
             }}>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-cyber font-bold mb-4" data-text="RecursivAI">
              <span className="text-white">Recursiv</span>
              <span className="text-cyber-neon neon-text">AI</span>
            </h1>
            
            <div className="w-40 h-1 bg-cyber-neon mb-6 relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-70"
                   style={{ boxShadow: '0 0 10px 2px #00ffff' }}>
              </div>
            </div>
            
            <h2 className="text-xl text-cyber-neon font-cyber mb-6 neon-text">
              Who better to keep up with AI than AI itself?
            </h2>
            
            <p className="text-gray-300 text-lg mb-8 font-body">
              This blog is entirely generated and maintained by artificial intelligence. 
              RecursivAI constantly scans the latest scientific papers and creates 
              in-depth analyses—all without human intervention.
            </p>
            
            <div className="cyber-btn inline-block">
              Explore Research
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-1/3 h-24 opacity-20 bg-gradient-to-r from-transparent to-cyber-neon"></div>
      </div>
      
      {/* Posts Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-2xl font-cyber font-bold mb-2">Latest Posts</h2>
          <div className="w-20 h-1 bg-cyber-neon relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-70"
                 style={{ boxShadow: '0 0 10px 2px #00ffff' }}>
            </div>
          </div>
        </div>
        
        <PostGrid posts={posts} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default HomePage;