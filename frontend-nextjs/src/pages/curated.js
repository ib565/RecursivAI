import React, { useState, useEffect } from "react";
import PostGrid from "../components/PostGrid";
import { getAllPosts } from "../utils/apiService";
import SEO from "../components/SEO";
import { useRouter } from "next/router";

export default function CuratedPage({ initialPosts }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(false); // Changed from true since we have initial data
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 21;

  const fetchPosts = async (isInitialLoad = true, currentOffset = offset) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // CRITICAL: Preserve the specific filtering logic for curated posts
      const data = await getAllPosts({
        post_types: "curated", // IMPORTANT: This filters for curated posts only
        sort_by: "published_date",
        limit: POSTS_PER_PAGE,
        offset: isInitialLoad ? 0 : currentOffset,
      });

      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      if (isInitialLoad) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to fetch curated posts:", err);
      setError(err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Set up initial pagination state based on initialPosts
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
      setOffset(initialPosts.length);
      if (initialPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }
    }
  }, [initialPosts]);

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    
    const nextOffset = posts.length;
    setOffset(nextOffset);
    fetchPosts(false, nextOffset);
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-gray">
        <div className="container mx-auto px-4 py-24">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <p className="text-amber-400 font-cyber">Loading curated research...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-gray">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto bg-cyber-dark p-6 rounded-lg border border-amber-400 relative">
            <div className="absolute inset-0 bg-amber-400 opacity-5 animate-pulse"></div>
            <h2 className="text-amber-400 text-xl mb-4 font-cyber">
              Error Loading Curated Posts
            </h2>
            <p className="text-gray-300 mb-4">
              Unable to load curated research content. Please check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-amber-400 text-cyber-black hover:bg-amber-300 transition-colors font-cyber rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-gray">
      <SEO 
        title="Foundational AI Research | RecursivAI"
        description="Explore carefully curated foundational AI research papers and breakthroughs. Deep dive into the most important developments in artificial intelligence and machine learning."
        keywords="AI research, machine learning papers, foundational AI, research papers, artificial intelligence, deep learning, curated research"
      />
      
      {/* Cyberpunk scanlines effect */}
      <div className="scanlines"></div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            {/* Animated title with amber theme */}
            <h1 className="text-5xl md:text-7xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 animate-pulse mb-6">
              Foundational AI Research
            </h1>
            
            {/* Glowing amber divider */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-1 bg-amber-400 relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-70" style={{ boxShadow: "0 0 15px 3px #FFC107" }}></div>
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-body max-w-4xl mx-auto leading-relaxed">
              Carefully curated papers that shaped the foundation of modern AI. 
              These are the breakthroughs that defined artificial intelligence as we know it today.
            </p>
            
            {/* Description */}
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-lg text-gray-400 font-body leading-relaxed">
                From neural networks to transformers, from computer vision to natural language processing — 
                explore the seminal works that built the AI revolution. Each post includes comprehensive analysis, 
                key insights, and practical implications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-cyber text-amber-400 mb-4">
              Landmark Papers
            </h2>
            <p className="text-gray-400 text-lg font-body">
              The research that transformed artificial intelligence
            </p>
          </div>
          
          {posts.length > 0 ? (
            <>
              <PostGrid posts={posts} />
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className={`px-8 py-3 bg-amber-400 text-cyber-black hover:bg-amber-300 transition-all duration-300 font-cyber rounded ${
                      loadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-black inline-block mr-2"></div>
                        Loading More...
                      </>
                    ) : (
                      'Load More Research'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto bg-cyber-dark p-8 rounded-lg border border-amber-400">
                <h3 className="text-amber-400 text-xl mb-4 font-cyber">
                  No Curated Posts Available
                </h3>
                <p className="text-gray-400">
                  We're working on curating more foundational research papers. Check back soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Back Navigation */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <button 
            onClick={goBack}
            className="cyber-btn-outline px-8 py-3 font-cyber transition-all duration-300"
          >
            ← Back to Main Feed
          </button>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const POSTS_PER_PAGE = 21;
    // CRITICAL: Preserve the specific filtering logic for curated posts
    const posts = await getAllPosts({
      post_types: "curated", // IMPORTANT: This filters for curated posts only
      sort_by: "published_date",
      limit: POSTS_PER_PAGE,
      offset: 0,
    });
    return { props: { initialPosts: posts } };
  } catch (error) {
    console.error('Failed to fetch initial curated posts:', error);
    return { props: { initialPosts: [], error: 'Failed to load curated posts' } };
  }
}