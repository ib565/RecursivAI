import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsPosts } from "../utils/apiService";
import { formatDate } from "../utils/formatters";
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

const NewsPage = ({ initialPosts, error }) => {
  // Mock data for demonstration
  const mockPosts = [
    {
      slug: "google-windsurf-acquisition",
      title: "Google Acquires Wind Surf: AI Coding Revolution",
      summary: "In a groundbreaking move, Google has acquired Wind Surf, the AI-powered development platform that's revolutionizing code generation. This acquisition signals Google's commitment to advancing AI-assisted programming tools.",
      featured_image_url: "/images/placeholder-1.jpeg",
      created_at: "2025-01-20T10:00:00Z"
    },
    {
      slug: "openai-gpt5-release",
      title: "OpenAI Announces GPT-5: The Next Evolution",
      summary: "OpenAI has officially announced GPT-5, promising unprecedented capabilities in reasoning, creativity, and multimodal understanding. Early tests show remarkable improvements over GPT-4.",
      featured_image_url: "/images/placeholder-2.jpg",
      created_at: "2025-01-19T15:30:00Z"
    },
    {
      slug: "meta-multimodal-breakthrough",
      title: "Meta's New Multimodal AI Breaks All Records",
      summary: "Meta's latest multimodal AI model has achieved record-breaking performance across vision, language, and audio tasks. The model shows unprecedented understanding of complex real-world scenarios.",
      featured_image_url: "/images/placeholder-3.png",
      created_at: "2025-01-18T12:15:00Z"
    },
    {
      slug: "deepmind-protein-folding",
      title: "Google DeepMind Solves Protein Folding 2.0",
      summary: "DeepMind's latest breakthrough in protein structure prediction has solved previously intractable problems, opening new possibilities for drug discovery and disease treatment.",
      featured_image_url: "/images/placeholder-4.jpg",
      created_at: "2025-01-17T09:45:00Z"
    },
    {
      slug: "microsoft-copilot-upgrade",
      title: "Microsoft Copilot Gets Major AI Upgrade",
      summary: "Microsoft has released a major upgrade to Copilot, introducing advanced code generation, debugging assistance, and real-time collaboration features that transform the development experience.",
      featured_image_url: "/images/placeholder-1.jpeg",
      created_at: "2025-01-16T14:20:00Z"
    },
    {
      slug: "tesla-fsd-human-parity",
      title: "Tesla's FSD Beta Achieves Human-Level Driving",
      summary: "Tesla's Full Self-Driving Beta has reached human parity in complex urban environments, marking a significant milestone in autonomous vehicle technology.",
      featured_image_url: "/images/placeholder-2.jpg",
      created_at: "2025-01-15T11:30:00Z"
    },
    {
      slug: "anthropic-constitutional-ai",
      title: "Anthropic Announces Constitutional AI 3.0",
      summary: "Anthropic has released Constitutional AI 3.0, featuring enhanced safety mechanisms and improved alignment with human values while maintaining exceptional performance.",
      featured_image_url: "/images/placeholder-3.png",
      created_at: "2025-01-14T16:45:00Z"
    },
    {
      slug: "nvidia-ai-supercomputer",
      title: "NVIDIA Unveils Next-Gen AI Supercomputer",
      summary: "NVIDIA has announced its latest AI supercomputer, capable of training models 10x faster than current systems, accelerating the pace of AI research and development.",
      featured_image_url: "/images/placeholder-4.jpg",
      created_at: "2025-01-13T13:10:00Z"
    },
    {
      slug: "ai-healthcare-diagnosis",
      title: "AI Achieves 99% Accuracy in Medical Diagnosis",
      summary: "A new AI system has achieved 99% accuracy in diagnosing rare diseases, outperforming human specialists and potentially saving countless lives through early detection.",
      featured_image_url: "/images/placeholder-1.jpeg",
      created_at: "2025-01-12T10:25:00Z"
    },
    {
      slug: "quantum-ai-breakthrough",
      title: "Quantum AI Breakthrough: 1000x Speed Improvement",
      summary: "Researchers have achieved a 1000x speed improvement in quantum AI algorithms, bringing quantum computing applications closer to practical reality.",
      featured_image_url: "/images/placeholder-2.jpg",
      created_at: "2025-01-11T08:50:00Z"
    },
    {
      slug: "ai-climate-prediction",
      title: "AI Predicts Climate Patterns with 95% Accuracy",
      summary: "A new AI model can predict climate patterns and extreme weather events with 95% accuracy, helping communities prepare for and mitigate climate change impacts.",
      featured_image_url: "/images/placeholder-3.png",
      created_at: "2025-01-10T15:15:00Z"
    },
    {
      slug: "robotics-ai-coordination",
      title: "AI-Powered Robots Achieve Perfect Coordination",
      summary: "A team of AI-powered robots has achieved perfect coordination in complex tasks, demonstrating the potential for autonomous systems in manufacturing and logistics.",
      featured_image_url: "/images/placeholder-4.jpg",
      created_at: "2025-01-09T12:40:00Z"
    }
  ];

  const posts = mockPosts; // Use mock data instead of initialPosts
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
          <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
            
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
          
          <Header />

          {/* Main Content */}
          <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
            
                         {/* Wireframe-inspired News Grid */}
             <div className="border-t-2 border-double border-gray-400 pt-6 mb-8">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                 
                                   {/* Left Column - Latest News List */}
                  <div className="lg:col-span-3 border-r border-gray-300 pr-4">
                    <h3 className="text-lg font-serif font-bold mb-4 border-b border-gray-300 pb-2">Latest News:</h3>
                                         <div className="space-y-3">
                       {posts.slice(0, 6).map((post, index) => (
                         <Link key={post.slug} href={`/post/${post.slug}`} className="group block hover:bg-yellow-50 hover:shadow-md transition-all duration-300 p-3 rounded-lg border border-transparent hover:border-yellow-200">
                           <div className="text-sm font-serif group-hover:text-gray-800 transition-colors">
                             <span className="font-bold text-yellow-600 group-hover:text-yellow-700">{index + 1}.</span> {post.title}
                           </div>
                           <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             {formatDate(post.created_at)}
                           </div>
                         </Link>
                       ))}
                     </div>
                  </div>

                                   {/* Center Column - Main Story */}
                  <div className="lg:col-span-6 border-r border-gray-300 pr-4">
                                         {posts.slice(0, 2).map((post, index) => (
                       <div key={post.slug} className="mb-6 group">
                         <Link href={`/post/${post.slug}`} className="block hover:bg-yellow-50 hover:shadow-lg transition-all duration-300 p-6 rounded-lg border border-transparent hover:border-yellow-200 transform hover:-translate-y-1">
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
                               <div className="w-full h-full bg-yellow-200 border border-gray-400 flex items-center justify-center group-hover:bg-yellow-300 transition-colors duration-300">
                                 <div className="text-center">
                                   <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">📰</div>
                                   <div className="text-sm font-serif text-gray-600">Rex Approved</div>
                                 </div>
                               </div>
                             )}
                           </div>
                           <p className="text-sm font-serif mb-3 leading-relaxed group-hover:text-gray-700 transition-colors">
                             {post.summary}
                           </p>
                           <div className="flex items-center justify-between">
                             <p className="text-xs text-gray-500 italic group-hover:text-gray-600 transition-colors">
                               {formatDate(post.created_at)}
                             </p>
                             <span className="text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                               Read More →
                             </span>
                           </div>
                         </Link>
                                                 <div className="mt-4 p-3 bg-blue-50 border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors duration-300 rounded-lg">
                           <p className="text-xs font-serif italic group-hover:text-blue-800 transition-colors">
                             🦕 <strong>Rex&apos;s Take:</strong> &quot;This is a significant development in the AI landscape!&quot;
                           </p>
                         </div>
                      </div>
                    ))}
                  </div>

                {/* Right Column - Multiple Sections */}
                <div className="lg:col-span-3 space-y-6">
                  
                                     {/* AI 101 Section */}
                   <div className="border border-gray-400 p-4 bg-white hover:shadow-lg hover:border-yellow-300 transition-all duration-300 rounded-lg group cursor-pointer">
                     <h3 className="text-lg font-serif font-bold mb-3 text-center border-b border-gray-300 pb-2 group-hover:text-yellow-700 transition-colors">
                       AI 101: RAG
                     </h3>
                     <div className="aspect-square mb-3 bg-yellow-200 border border-gray-300 flex items-center justify-center group-hover:bg-yellow-300 group-hover:scale-105 transition-all duration-300 rounded-lg">
                       <div className="text-center">
                         <div className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-300">📚</div>
                         <div className="text-xs font-serif group-hover:text-gray-800 transition-colors">Rex Explains</div>
                       </div>
                     </div>
                     <p className="text-sm font-serif mb-2 group-hover:text-gray-800 transition-colors">
                       <strong>RAG = AI + Library Pass + Brain.</strong>
                     </p>
                     <p className="text-xs font-serif text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors">
                       It retrieves real info (the &quot;R&quot;) and then generates a smart answer (the &quot;G&quot;) - kind of like a 
                       kid writing a book report with Wikipedia open in another tab.
                     </p>
                   </div>

                                     {/* Rexommendation */}
                   <div className="border border-gray-400 p-4 bg-white hover:shadow-lg hover:border-yellow-300 transition-all duration-300 rounded-lg group cursor-pointer">
                     <h3 className="text-lg font-serif font-bold mb-3 group-hover:text-yellow-700 transition-colors">Rexommendation</h3>
                     <div className="aspect-square mb-3 bg-yellow-200 border border-gray-300 flex items-center justify-center group-hover:bg-yellow-300 group-hover:scale-105 transition-all duration-300 rounded-lg">
                       <div className="text-center">
                         <div className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-300">🦕</div>
                         <div className="text-xs font-serif group-hover:text-gray-800 transition-colors">Rex Picks</div>
                       </div>
                     </div>
                     <p className="text-sm font-serif font-bold mb-1 group-hover:text-gray-800 transition-colors">Try Windsurf!</p>
                     <p className="text-xs font-serif text-blue-600 underline mb-2 group-hover:text-blue-700 transition-colors">Link ↗</p>
                     <p className="text-xs font-serif text-gray-700 group-hover:text-gray-800 transition-colors">
                       The new AI coding tool that caught Google&apos;s attention
                     </p>
                     <div className="mt-2 text-center">
                       <span className="text-xs font-serif font-bold group-hover:text-yellow-700 transition-colors">Rex Score: 9/10</span>
                     </div>
                   </div>

                                     {/* Corporate Cringe */}
                   <div className="border border-gray-400 p-4 bg-white hover:shadow-lg hover:border-red-300 transition-all duration-300 rounded-lg group cursor-pointer">
                     <h3 className="text-base font-serif font-bold mb-3 group-hover:text-red-700 transition-colors">Corporate Cringe of the Week</h3>
                     <div className="flex items-start gap-3">
                       <div className="w-16 h-16 bg-yellow-200 border border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-300 rounded-lg">
                         <div className="text-center">
                           <div className="text-lg group-hover:scale-110 transition-transform duration-300">🦕</div>
                           <div className="text-xs font-serif group-hover:text-red-700 transition-colors">Yikes</div>
                         </div>
                       </div>
                       <div className="flex-1">
                         <p className="text-xs font-serif text-gray-700 leading-relaxed mb-2 group-hover:text-gray-800 transition-colors">
                           &quot;Our revolutionary AI breakthrough will disrupt every industry and create unlimited synergistic 
                           value propositions while leveraging blockchain-enabled quantum machine learning...&quot;
                         </p>
                         <p className="text-xs font-serif italic text-gray-600 group-hover:text-red-600 transition-colors">
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
                   className="px-8 py-3 bg-black text-white font-serif font-bold hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-300 transform"
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

          <Footer />
        </div>
      </div>
    </>
  );
};

export default NewsPage;

export async function getStaticProps() {
  // Return mock data for demonstration
  return { 
    props: { initialPosts: [] }, // Empty array since we're using mock data in component
    revalidate: 300 // Re-generate the page every 5 minutes
  };
}