import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsPosts, getAi101Posts } from "../utils/apiService";
import SEO from "../components/SEO";
import Header from "../components/Header";
import Footer from "../components/Footer";

const placeholderImages = [
  "/images/placeholder-1.jpeg",
  "/images/placeholder-2.jpg",
  "/images/placeholder-3.png",
  "/images/placeholder-4.jpg",
];

const getPlaceholderImage = (index) => {
  return placeholderImages[index % placeholderImages.length];
};

const NUM_POSTS_TO_FETCH = 12;

const NewsPage = ({ initialPosts, ai101Posts, error }) => {
  const posts = useMemo(() => {
    if (!initialPosts || !initialPosts.length) {
      return [];
    }
    return initialPosts;
  }, [initialPosts]);

  const latestAi101 = useMemo(() => {
    if (!ai101Posts || !ai101Posts.length) {
      return null;
    }
    return ai101Posts[0];
  }, [ai101Posts]);

  const spotlightPost = useMemo(() => {
    if (!posts || posts.length <= 4) return null;
    return posts[4];
  }, [posts]);

  const featuredLatestPost = useMemo(() => {
    if (!posts || posts.length <= 2) return null;
    return posts[2];
  }, [posts]);

  const latestNewsPosts = useMemo(() => {
    if (!posts || posts.length <= 3) return [];
    return posts.slice(3, 12);
  }, [posts]);

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubscribeError('');
    if (!email || !email.includes('@')) {
      setSubscribeError('Please enter a valid email.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Subscription failed');
      }
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (err) {
      setSubscribeError(err.message || 'Subscription failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <>
        <SEO
          title="AI News | RecursivAI"
          description="Latest AI and technology news analyzed by artificial intelligence"
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
                    Breaking News: Technical Difficulties!
                  </h2>
                  <p className="text-lg font-serif text-gray-700 mb-6">
                    Rex is having trouble fetching today&apos;s AI news. Even dinosaurs have bad days!
                  </p>
                </div>
                
                <div className="border-2 border-red-300 p-8 bg-red-50 mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 text-red-700">
                    What happened?
                  </h3>
                  <div className="text-left space-y-3 text-sm font-serif text-gray-700">
                    <p>• Our news servers might be taking a coffee break ☕</p>
                    <p>• The AI news pipeline could be temporarily down</p>
                    <p>• Network connectivity issues (even Rex can&apos;t fix everything!)</p>
                    <p>• Database maintenance or updates in progress</p>
                  </div>
                </div>

                <div className="border-2 border-blue-300 p-8 bg-blue-50 mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 text-blue-700">
                    What you can do:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🔄</div>
                      <p className="font-serif font-bold mb-2">Refresh the Page</p>
                      <p className="text-sm text-gray-600">Sometimes a simple refresh does the trick!</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">⏰</div>
                      <p className="font-serif font-bold mb-2">Try Again Later</p>
                      <p className="text-sm text-gray-600">Rex is working hard to fix this!</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">📧</div>
                      <p className="font-serif font-bold mb-2">Check Other Sections</p>
                      <p className="text-sm text-gray-600">Browse our research and curated content</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">🦕</div>
                      <p className="font-serif font-bold mb-2">Contact Support</p>
                      <p className="text-sm text-gray-600">If this persists, let us know</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-red-600 text-white font-serif font-bold hover:bg-red-700 transition-colors border-2 border-red-600"
                  >
                    🔄 Try Again
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white font-serif font-bold hover:bg-blue-700 transition-colors border-2 border-blue-600"
                  >
                    🏠 Go Home
                  </Link>
                  <Link
                    href="/curated"
                    className="px-6 py-3 bg-green-600 text-white font-serif font-bold hover:bg-green-700 transition-colors border-2 border-green-600"
                  >
                    📚 Browse Research
                  </Link>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-serif italic text-gray-600">
                    🦕 <strong>Rex says:</strong> &quot;Don&apos;t worry, I&apos;m on it! This is just a temporary setback.&quot;
                  </p>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <SEO
          title="AI News | RecursivAI"
          description="Latest AI and technology news analyzed by artificial intelligence"
        />
        <div className="w-full bg-[#FAF9F5]">
          <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black max-auto">
            
            <Header />

            {/* Empty State Content */}
            <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="mb-8">
                  <div className="text-8xl mb-4">📰</div>
                  <h2 className="text-3xl font-serif font-bold mb-4 text-gray-700">
                    No News Today
                  </h2>
                  <p className="text-lg font-serif text-gray-600 mb-6">
                    Rex is taking a break from the news cycle. Even AI curators need downtime!
                  </p>
                </div>
                
                <div className="border-2 border-gray-300 p-8 bg-gray-50 mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 text-gray-700">
                    What&apos;s happening?
                  </h3>
                  <div className="text-left space-y-3 text-sm font-serif text-gray-600">
                    <p>• Rex might be updating the news pipeline</p>
                    <p>• No major AI developments to report today</p>
                    <p>• System maintenance in progress</p>
                    <p>• Taking time to curate quality content</p>
                  </div>
                </div>

                <div className="border-2 border-blue-300 p-8 bg-blue-50 mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 text-blue-700">
                    While you wait:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">📚</div>
                      <p className="font-serif font-bold mb-2">Browse Research</p>
                      <p className="text-sm text-gray-600">Check out our latest AI research papers</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">🎯</div>
                      <p className="font-serif font-bold mb-2">Curated Content</p>
                      <p className="text-sm text-gray-600">Hand-picked AI insights and analysis</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl mb-3">📧</div>
                      <p className="font-serif font-bold mb-2">Subscribe</p>
                      <p className="text-sm text-gray-600">Get notified when news is back</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white font-serif font-bold hover:bg-blue-700 transition-colors border-2 border-blue-600"
                  >
                    🏠 Go Home
                  </Link>
                  <Link
                    href="/curated"
                    className="px-6 py-3 bg-green-600 text-white font-serif font-bold hover:bg-green-700 transition-colors border-2 border-green-600"
                  >
                    📚 Browse Research
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gray-600 text-white font-serif font-bold hover:bg-gray-700 transition-colors border-2 border-gray-600"
                  >
                    🔄 Check Again
                  </button>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-serif italic text-gray-600">
                    🦕 <strong>Rex says:</strong> &quot;Sometimes the best news is no news. Quality over quantity!&quot;
                  </p>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="AI News | RecursivAI"
        description="Latest artificial intelligence and technology news, analyzed and summarized by AI. Stay updated with breaking developments in machine learning, AI research, and tech innovation."
        keywords="AI news, technology news, artificial intelligence, machine learning news, tech updates, AI breakthroughs"
      />
      
      <div className="w-full bg-[#FAF9F5]">
        <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black max-auto">
          
          <Header />

          {/* Main Content */}
          <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
            
                         {/* Wireframe-inspired News Grid */}
             <div className="border-t-2 border-double border-gray-400 pt-6 mb-8">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                 
                  {/* Left Column - Latest News List */}
                  <div className="order-2 lg:order-none lg:col-span-3 lg:border-r lg:border-gray-300 lg:pr-4">
                    <h3 className="text-lg font-serif font-bold mb-4 border-b border-gray-300 pb-2">Latest News:</h3>
                    <div className="space-y-2">
                      {latestNewsPosts.map((post) => (
                        <Link
                          key={post.slug}
                          href={`/post/${post.slug}`}
                          className="group relative flex gap-2 pl-5 text-sm font-serif leading-snug text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <span className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-yellow-600"></span>
                          <span>{post.title}</span>
                        </Link>
                      ))}
                    </div>

                    {featuredLatestPost && (
                      <Link
                        href={`/post/${featuredLatestPost.slug}`}
                        className="mt-6 block border border-gray-300 bg-white p-4 rounded-lg hover:shadow-lg hover:border-yellow-300 transition-all duration-300 group"
                      >
                        <div className="aspect-video mb-3 overflow-hidden relative rounded-md border border-gray-200">
                          {featuredLatestPost.featured_image_url ? (
                            <Image
                              src={featuredLatestPost.featured_image_url}
                              alt={featuredLatestPost.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Image
                              src={getPlaceholderImage(2)}
                              alt="News highlight"
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <h4 className="text-base font-serif font-bold mb-2 group-hover:text-gray-800 transition-colors">
                          {featuredLatestPost.title}
                        </h4>
                        {featuredLatestPost.summary && (
                          <p className="text-xs font-serif text-gray-600 leading-relaxed line-clamp-4">
                            {featuredLatestPost.summary}
                          </p>
                        )}
                    {featuredLatestPost.ai_metadata?.rex_take && (
                      <p className="mt-3 text-xs font-serif italic text-blue-700">
                        🦕 Rex&apos;s Take: {featuredLatestPost.ai_metadata.rex_take}
                      </p>
                    )}
                      </Link>
                    )}
                  </div>

                  {/* Center Column - Main Story */}
                  <div className="order-1 lg:order-none lg:col-span-6 lg:border-r lg:border-gray-300 lg:pr-4">
                    {posts.slice(0, 2).map((post, index) => (
                      <div key={post.slug} className="mb-6 group">
                        <Link
                          href={`/post/${post.slug}`}
                          className="block hover:bg-yellow-50 hover:shadow-lg transition-all duration-300 p-6 rounded-lg border border-transparent hover:border-yellow-200 transform hover:-translate-y-1"
                        >
                          <div className="flex items-center mb-3">
                            <span className="text-yellow-600 font-bold text-lg mr-3 group-hover:scale-110 transition-transform duration-300">📰</span>
                            <h2 className="text-2xl font-serif font-bold group-hover:text-gray-800 transition-colors">
                              {post.title}
                            </h2>
                          </div>
                          <div className="aspect-[16/9] mb-4 overflow-hidden relative rounded-lg group-hover:shadow-md transition-shadow duration-300">
                            {post.featured_image_url ? (
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                            ) : (
                              <Image
                                src={getPlaceholderImage(index)}
                                alt="News placeholder"
                                fill
                                className="object-cover opacity-90"
                              />
                            )}
                          </div>
                          {post.summary && (
                            <p className="text-sm font-serif mb-3 leading-relaxed group-hover:text-gray-700 transition-colors">
                              {post.summary}
                            </p>
                          )}
                        </Link>
                        {post.ai_metadata?.rex_take && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors duration-300 rounded-lg">
                            <p className="text-xs font-serif italic group-hover:text-blue-800 transition-colors">
                              🦕 <strong>Rex&apos;s Take:</strong> {post.ai_metadata.rex_take}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                {/* Right Column - Highlights */}
                <div className="order-3 lg:order-none lg:col-span-3 space-y-6">
                  {latestAi101 ? (
                    <Link
                      href={`/post/${latestAi101.slug}`}
                      className="block border border-gray-400 p-4 bg-white hover:shadow-lg hover:border-yellow-300 transition-all duration-300 rounded-lg group"
                    >
                      <h3 className="text-lg font-serif font-bold mb-3 text-center border-b border-gray-300 pb-2 group-hover:text-yellow-700 transition-colors">
                        {latestAi101.title}
                      </h3>
                      <div className="aspect-square mb-3 overflow-hidden relative rounded-lg border border-gray-300 bg-yellow-100">
                        {latestAi101.featured_image_url ? (
                          <Image
                            src={latestAi101.featured_image_url}
                            alt={latestAi101.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-200">
                            <span className="text-4xl">📚</span>
                          </div>
                        )}
                      </div>
                      {latestAi101.summary && (
                        <p className="text-sm font-serif text-gray-800 group-hover:text-gray-900 transition-colors">
                          {latestAi101.summary}
                        </p>
                      )}
                    </Link>
                  ) : (
                    <div className="border border-dashed border-gray-300 p-4 bg-white rounded-lg text-center text-sm font-serif text-gray-500">
                      AI 101 explainer coming soon.
                    </div>
                  )}

                  <div className="border border-gray-400 p-4 bg-white hover:shadow-lg hover:border-yellow-300 transition-all duration-300 rounded-lg group">
                    <h3 className="text-lg font-serif font-bold mb-3 group-hover:text-yellow-700 transition-colors">Rexommendation</h3>
                    <p className="text-sm font-serif font-bold mb-1 group-hover:text-gray-800 transition-colors">Try Windsurf!</p>
                    <p className="text-xs font-serif text-gray-700 group-hover:text-gray-800 transition-colors">
                      The new AI coding tool that caught Rex&apos;s attention.
                    </p>
                    <p className="text-xs font-serif text-gray-500 mt-2">More recommendations coming soon.</p>
                  </div>

                  {spotlightPost && (
                    <Link
                      href={`/post/${spotlightPost.slug}`}
                      className="block border border-gray-400 p-4 bg-white hover:shadow-lg hover:border-yellow-300 transition-all duration-300 rounded-lg group"
                    >
                      <div className="aspect-video mb-3 overflow-hidden relative rounded-lg border border-gray-300 bg-yellow-100">
                        {spotlightPost.featured_image_url ? (
                          <Image
                            src={spotlightPost.featured_image_url}
                            alt={spotlightPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-200">
                            <span className="text-4xl">📰</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-serif font-bold mb-2 group-hover:text-gray-800 transition-colors">
                        {spotlightPost.title}
                      </p>
                      {spotlightPost.summary && (
                        <p className="text-xs font-serif text-gray-700 leading-relaxed mb-2 group-hover:text-gray-800 transition-colors">
                          {spotlightPost.summary}
                        </p>
                      )}
                      {spotlightPost.ai_metadata?.rex_take && (
                        <p className="text-xs font-serif italic text-blue-700 group-hover:text-blue-800 transition-colors">
                          🦕 Rex&apos;s Take: {spotlightPost.ai_metadata.rex_take}
                        </p>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Final CTA - Newspaper Ad Style */}
            <div className="border-4 border-double border-black p-8 bg-white text-center mb-8">
              <div className="border-b-2 border-gray-300 pb-4 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Limited Time Offer</h3>
                <h2 className="text-3xl font-serif font-black mb-2">FREE LIFETIME SUBSCRIPTION</h2>
                <p className="text-lg font-serif">To Rex&apos;s Daily AI Intelligence Report</p>
              </div>
              
              <div className="flex justify-center items-center mb-6">
                <div className="text-6xl mr-4">🦕</div>
                <div className="text-left">
                  <h3 className="text-xl font-serif font-bold">Join Rex&apos;s Growing Pack!</h3>
                  <p className="font-serif">220+ AI professionals can&apos;t be wrong</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-base font-serif"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 bg-black text-white font-serif font-bold transition-all duration-300 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800 hover:scale-105 hover:shadow-lg transform'
                  }`}
                >
                  {submitting ? 'Subscribing…' : 'CLAIM YOUR SPOT'}
                </button>
              </form>

              {subscribeError && (
                <div className="max-w-md mx-auto mb-3 w-full p-3 bg-red-100 text-red-800 font-serif border border-red-300">
                  {subscribeError}
                </div>
              )}
              {isSubscribed && (
                <div className="max-w-md mx-auto mb-3 w-full p-3 bg-green-100 text-green-800 font-serif border border-green-300">
                  🦕 ✓ Rex is on it. Check your inbox in the next few minutes.
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4 text-xs font-serif text-gray-600 border-t border-gray-300 pt-4">
                <div>✅ 100% Free Forever</div>
                <div>✅ Daily 7AM Delivery</div>
                <div>✅ Unsubscribe Anytime</div>
              </div>
              
              <p className="text-sm font-serif italic mt-4 text-gray-700">
                &quot;Don&apos;t let AI evolution leave you behind like it did my fellow dinosaurs!&quot; - Rex 🦕
              </p>
            </div>

          </main>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default NewsPage;

export async function getStaticProps() {
  try {
    const [posts, ai101Posts] = await Promise.all([
      getNewsPosts({ limit: NUM_POSTS_TO_FETCH }),
      getAi101Posts({ limit: 1 }),
    ]);

    return {
      props: { initialPosts: posts, ai101Posts },
      revalidate: 300,
    };
  } catch (error) {
    console.error('Failed to fetch initial news posts:', error);
    return {
      props: { initialPosts: [], ai101Posts: [], error: 'Failed to load news posts' },
      revalidate: 300,
    };
  }
}