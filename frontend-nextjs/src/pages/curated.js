import React, { useState, useEffect } from "react";
import PostGrid from "../components/PostGrid";
import { getAllPosts } from "../utils/apiService";
import SEO from "../components/SEO";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CuratedPage({ initialPosts }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts || []);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 21;

  const fetchPosts = async (isInitialLoad = true, currentOffset = offset) => {
    try {
      setLoadingMore(true);

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
      setLoadingMore(false);
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

  if (error) {
      return (
    <>
      <SEO
        title="Foundational AI Research | RecursivAI"
        description="Explore carefully curated foundational AI research papers and breakthroughs. Deep dive into the most important developments in artificial intelligence and machine learning."
      />
      <div className="w-full bg-[#FAF9F5]">
        <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black max-auto">
          <Header />
            
            {/* Error Content */}
            <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="mb-8">
                  <div className="text-8xl mb-4">🦕</div>
                  <h2 className="text-3xl font-serif font-bold mb-4 text-red-600">
                    Research Library Temporarily Closed!
                  </h2>
                  <p className="text-lg font-serif text-gray-700 mb-6">
                    Rex is having trouble accessing the curated research papers. Even AI librarians have bad days!
                  </p>
                </div>
                
                <div className="border-2 border-red-300 p-8 bg-red-50 mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 text-red-700">
                    What happened?
                  </h3>
                  <div className="text-left space-y-3 text-sm font-serif text-gray-700">
                    <p>• Our research database might be taking a coffee break ☕</p>
                    <p>• The AI curation pipeline could be temporarily down</p>
                    <p>• Network connectivity issues (even Rex can&apos;t fix everything!)</p>
                    <p>• Database maintenance or updates in progress</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-red-600 text-white font-serif font-bold hover:bg-red-700 transition-colors border-2 border-red-600"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={goBack}
                    className="px-6 py-3 bg-blue-600 text-white font-serif font-bold hover:bg-blue-700 transition-colors border-2 border-blue-600"
                  >
                    ← Go Back
                  </button>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-serif italic text-gray-600">
                    🦕 <strong>Rex says:</strong> &quot;Don&apos;t worry, I&apos;m on it! This is just a temporary setback.&quot;
                  </p>
                </div>
              </div>
            </main>

          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Foundational AI Research | RecursivAI"
        description="Explore carefully curated foundational AI research papers and breakthroughs. Deep dive into the most important developments in artificial intelligence and machine learning."
        keywords="AI research, machine learning papers, foundational AI, research papers, artificial intelligence, deep learning, curated research"
      />
      
      <div className="w-full bg-[#FAF9F5]">
        <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black max-auto">

          {/* Main Content */}
          <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
            
            {/* Hero Section */}
            <section className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-serif font-black mb-6 text-black">
                Foundational AI Research
              </h1>
              
              {/* Decorative divider */}
              <div className="flex justify-center mb-8">
                <div className="w-32 h-1 bg-black"></div>
              </div>
              
              <p className="text-xl md:text-2xl font-serif text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
                Curated papers that shaped the foundation of Generative AI. 
                These are the breakthroughs that defined artificial intelligence as we know it today.
              </p>
            </section>

            {/* Posts Grid Section */}
            <section className="mb-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-black">
                  Landmark Papers
                </h2>
                <p className="text-gray-600 text-lg font-serif">
                  The research that transformed artificial intelligence
                </p>
              </div>
              
              {posts.length > 0 ? (
                <>
                  <PostGrid posts={posts} error={error} />
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className={`px-8 py-3 bg-black text-white font-serif font-bold hover:bg-gray-800 transition-all duration-300 ${
                          loadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
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
                  <div className="max-w-md mx-auto bg-white p-8 rounded-lg border-2 border-black">
                    <h3 className="text-black text-xl mb-4 font-serif font-bold">
                      No Curated Posts Available
                    </h3>
                    <p className="text-gray-600 font-serif">
                      We&apos;re working on curating more foundational research papers. Check back soon!
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Back Navigation */}
            <section className="py-8">
              <div className="text-center">
                <button 
                  onClick={goBack}
                  className="px-8 py-3 border-2 border-black text-black font-serif font-bold hover:bg-black hover:text-white transition-all duration-300"
                >
                  ← Back to Main Feed
                </button>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const POSTS_PER_PAGE = 21;
    // CRITICAL: Preserve the specific filtering logic for curated posts
    const posts = await getAllPosts({
      post_types: "curated", // IMPORTANT: This filters for curated posts only
      sort_by: "published_date",
      limit: POSTS_PER_PAGE,
      offset: 0,
    });
    return { 
      props: { initialPosts: posts || [] },
      // Revalidate on-demand only (via API call after news generation)
    };
  } catch (error) {
    console.error('Failed to fetch initial curated posts:', error);
    // Return empty array so Next.js can serve cached/old content when backend is sleeping
    return { props: { initialPosts: [] } };
  }
}