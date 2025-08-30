import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsPosts } from "../utils/apiService";
import { formatDate } from "../utils/formatters";
import SEO from "../components/SEO";

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

const NewsPage = ({ initialPosts, error }) => {
  const posts = initialPosts || [];
  const today = new Date();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  if (error) {
    return (
      <>
        <SEO
          title="AI News | RecursivAI"
          description="Latest AI and technology news analyzed by artificial intelligence"
        />
        <div className="w-full bg-[#FAF9F5]">
          <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
            
            {/* Header/Navigation */}
            <header className="pt-4 pb-4 bg-[#FAF9F5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="text-s tracking-wider font-medium">
                    {today.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-center flex-grow my-4">
                    <nav className="mb-1 font-body">
                      <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-black mx-3">News</Link>
                      <Link href="/" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Research</Link>
                      <Link href="/curated" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Curated</Link>
                      <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">About</Link>
                    </nav>
                    <h1 className="text-7xl font-serif font-black">
                      RecursivAI
                    </h1>
                    <p className="text-center text-base italic font-serif text-gray-700 mt-1 mb-4">
                      Who better to keep up with AI than AI itself?
                    </p>
                  </div>
                  <div className="text-s tracking-wider invisible">
                    {today.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </header>

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

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t-2 border-double border-black text-sm text-gray-500 bg-[#FAF9F5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">🦕</div>
                  <p className="font-serif">Rex approves this message</p>
                </div>
                <p className="text-center">© {new Date().getFullYear()} RecursivAI Times. All Rights Reserved. Rex ™ is a registered mascot.</p>
              </div>
            </footer>
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
          <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
            
            {/* Header/Navigation */}
            <header className="pt-4 pb-4 bg-[#FAF9F5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <div className="text-s tracking-wider font-medium">
                    {today.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-center flex-grow my-4">
                    <nav className="mb-1 font-body">
                      <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-black mx-3">News</Link>
                      <Link href="/" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Research</Link>
                      <Link href="/curated" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Curated</Link>
                      <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">About</Link>
                    </nav>
                    <h1 className="text-7xl font-serif font-black">
                      RecursivAI
                    </h1>
                    <p className="text-center text-base italic font-serif text-gray-700 mt-1 mb-4">
                      Who better to keep up with AI than AI itself?
                    </p>
                  </div>
                  <div className="text-s tracking-wider invisible">
                    {today.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </header>

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

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t-2 border-double border-black text-sm text-gray-500 bg-[#FAF9F5]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                <div className="text-center mb-4">
                  <div className="text-2xl mb-2">🦕</div>
                  <p className="font-serif">Rex approves this message</p>
                </div>
                <p className="text-center">© {new Date().getFullYear()} RecursivAI Times. All Rights Reserved. Rex ™ is a registered mascot.</p>
              </div>
            </footer>
          </div>
        </div>
      </>
    );
  }

  // Separate posts for different sections
  const mainFeature = posts[0];
  const secondaryFeatures = posts.slice(1, 3);
  const remainingPosts = posts.slice(3, NUM_POSTS_TO_FETCH);

  return (
    <>
      <SEO
        title="AI News | RecursivAI"
        description="Latest artificial intelligence and technology news, analyzed and summarized by AI. Stay updated with breaking developments in machine learning, AI research, and tech innovation."
        keywords="AI news, technology news, artificial intelligence, machine learning news, tech updates, AI breakthroughs"
      />
      
      <div className="w-full bg-[#FAF9F5]">
        <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
          
          {/* Header/Navigation - Matching your news page exactly */}
          <header className="pt-4 pb-4 bg-[#FAF9F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="text-s tracking-wider font-medium">
                  {today.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-center flex-grow my-4">
                  <nav className="mb-1 font-body">
                    <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-black mx-3">News</Link>
                    <Link href="/" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Research</Link>
                    <Link href="/curated" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Curated</Link>
                    <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">About</Link>
                  </nav>
                  <h1 className="text-7xl font-serif font-black">
                    RecursivAI
                  </h1>
                  <p className="text-center text-base italic font-serif text-gray-700 mt-1 mb-4">
                    Who better to keep up with AI than AI itself?
                  </p>
                </div>
                <div className="text-s tracking-wider invisible">
                  {today.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
            
            {/* Wireframe-inspired News Grid */}
            <div className="border-t-2 border-double border-gray-400 pt-6 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column - Latest News List */}
                <div className="lg:col-span-3 border-r border-gray-300 pr-4">
                  <h3 className="text-lg font-serif font-bold mb-4 border-b border-gray-300 pb-2">Latest News:</h3>
                  <div className="space-y-3">
                    <div className="text-sm font-serif">
                      <span className="font-bold">1.</span> OpenAI Releases GPT-5: The Next Generation
                    </div>
                    <div className="text-sm font-serif">
                      <span className="font-bold">2.</span> Meta&apos;s New Multimodal AI Breaks Records
                    </div>
                    <div className="text-sm font-serif">
                      <span className="font-bold">3.</span> Google DeepMind Solves Protein Folding 2.0
                    </div>
                    <div className="text-sm font-serif">
                      <span className="font-bold">4.</span> Microsoft Copilot Gets Major Upgrade
                    </div>
                    <div className="text-sm font-serif">
                      <span className="font-bold">5.</span> Tesla&apos;s FSD Beta Achieves Human Parity
                    </div>
                    <div className="text-sm font-serif">
                      <span className="font-bold">6.</span> Anthropic Announces Constitutional AI 3.0
                    </div>
                  </div>
                </div>

                {/* Center Column - Main Story */}
                <div className="lg:col-span-6 border-r border-gray-300 pr-4">
                  <div className="mb-6">
                    <h2 className="text-2xl font-serif font-bold mb-3">
                      Google Hires Wind Surf Founders
                    </h2>
                    <div className="aspect-[16/9] mb-4 bg-yellow-200 border border-gray-400 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🏄‍♂️</div>
                        <div className="text-sm font-serif text-gray-600">Rex Approved</div>
                      </div>
                    </div>
                    <p className="text-sm font-serif mb-3 leading-relaxed">
                      In a surprise move that has Rex wagging his tail, Google has acquired the entire founding team of Wind Surf, 
                      the AI-powered development platform that revolutionized code generation. The acquisition signals Google&apos;s 
                      commitment to advancing AI-assisted programming tools and competing with GitHub Copilot.
                    </p>
                    <p className="text-sm font-serif leading-relaxed">
                      Rex&apos;s analysis suggests this move could accelerate Google&apos;s developer ecosystem significantly, 
                      bringing Wind Surf&apos;s innovative approach to mainstream Google Cloud services. The financial terms 
                      remain undisclosed, but industry insiders estimate the deal at $400M+.
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                      <p className="text-xs font-serif italic">
                        🦕 <strong>Rex&apos;s Take:</strong> &quot;This is huge for developers! Wind Surf&apos;s tech + Google&apos;s scale = game changer!&quot;
                      </p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-serif font-bold mb-3">
                      Google Hires Wind Surf Founders
                    </h2>
                    <div className="aspect-[16/9] mb-4 bg-yellow-200 border border-gray-400 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🏄‍♂️</div>
                        <div className="text-sm font-serif text-gray-600">Rex Approved</div>
                      </div>
                    </div>
                    <p className="text-sm font-serif mb-3 leading-relaxed">
                      In a surprise move that has Rex wagging his tail, Google has acquired the entire founding team of Wind Surf, 
                      the AI-powered development platform that revolutionized code generation. The acquisition signals Google&apos;s 
                      commitment to advancing AI-assisted programming tools and competing with GitHub Copilot.
                    </p>
                    <p className="text-sm font-serif leading-relaxed">
                      Rex&apos;s analysis suggests this move could accelerate Google&apos;s developer ecosystem significantly, 
                      bringing Wind Surf&apos;s innovative approach to mainstream Google Cloud services. The financial terms 
                      remain undisclosed, but industry insiders estimate the deal at $400M+.
                    </p>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
                      <p className="text-xs font-serif italic">
                        🦕 <strong>Rex&apos;s Take:</strong> &quot;This is huge for developers! Wind Surf&apos;s tech + Google&apos;s scale = game changer!&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Multiple Sections */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* AI 101 Section */}
                  <div className="border border-gray-400 p-4 bg-white">
                    <h3 className="text-lg font-serif font-bold mb-3 text-center border-b border-gray-300 pb-2">
                      AI 101: RAG
                    </h3>
                    <div className="aspect-square mb-3 bg-yellow-200 border border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-1">📚</div>
                        <div className="text-xs font-serif">Rex Explains</div>
                      </div>
                    </div>
                    <p className="text-sm font-serif mb-2">
                      <strong>RAG = AI + Library Pass + Brain.</strong>
                    </p>
                    <p className="text-xs font-serif text-gray-700 leading-relaxed">
                      It retrieves real info (the &quot;R&quot;) and then generates a smart answer (the &quot;G&quot;) - kind of like a 
                      kid writing a book report with Wikipedia open in another tab.
                    </p>
                  </div>

                  {/* Rexommendation */}
                  <div className="border border-gray-400 p-4 bg-white">
                    <h3 className="text-lg font-serif font-bold mb-3">Rexommendation</h3>
                    <div className="aspect-square mb-3 bg-yellow-200 border border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🦕</div>
                        <div className="text-xs font-serif">Rex Picks</div>
                      </div>
                    </div>
                    <p className="text-sm font-serif font-bold mb-1">Try Windsurf!</p>
                    <p className="text-xs font-serif text-blue-600 underline mb-2">Link ↗</p>
                    <p className="text-xs font-serif text-gray-700">
                      The new AI coding tool that caught Google&apos;s attention
                    </p>
                    <div className="mt-2 text-center">
                      <span className="text-xs font-serif font-bold">Rex Score: 9/10</span>
                    </div>
                  </div>

                  {/* Corporate Cringe */}
                  <div className="border border-gray-400 p-4 bg-white">
                    <h3 className="text-base font-serif font-bold mb-3">Corporate Cringe of the Week</h3>
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-yellow-200 border border-gray-300 flex items-center justify-center flex-shrink-0">
                        <div className="text-center">
                          <div className="text-lg">🦕</div>
                          <div className="text-xs font-serif">Yikes</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-serif text-gray-700 leading-relaxed mb-2">
                          &quot;Our revolutionary AI breakthrough will disrupt every industry and create unlimited synergistic 
                          value propositions while leveraging blockchain-enabled quantum machine learning...&quot;
                        </p>
                        <p className="text-xs font-serif italic text-gray-600">
                          🦕 Rex says: &quot;Just tell me what it actually does!&quot;
                        </p>
                      </div>
                    </div>
                  </div>

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
              
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-base font-serif"
                  required
                />
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-black text-white font-serif font-bold hover:bg-gray-800 transition-colors"
                >
                  CLAIM YOUR SPOT
                </button>
              </div>
              
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

          {/* Footer - Matching your news page */}
          <footer className="mt-8 pt-6 border-t-2 border-double border-black text-sm text-gray-500 bg-[#FAF9F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="text-center mb-4">
                <div className="text-2xl mb-2">🦕</div>
                <p className="font-serif">Rex approves this message</p>
              </div>
              <p className="text-center">© {new Date().getFullYear()} RecursivAI Times. All Rights Reserved. Rex ™ is a registered mascot.</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default NewsPage;

export async function getStaticProps() {
  try {
    const posts = await getNewsPosts({ limit: NUM_POSTS_TO_FETCH });
    return { 
      props: { initialPosts: posts },
      revalidate: 300 // Re-generate the page every 5 minutes
    };
  } catch (error) {
    console.error('Failed to fetch initial news posts:', error);
    return { props: { initialPosts: [], error: 'Failed to load news posts' } };
  }
}