import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const today = new Date();

  // Sample recent articles matching your news page structure
  const featuredArticles = [
    {
      title: "AI-Designed Antibiotics Show Promise Against Resistant Bacteria",
      summary: "MIT scientists use generative AI to create novel compounds, potentially ushering in a new era of antibiotic development.",
      date: "August 20, 2025",
      slug: "ai-antibiotics-resistant-bacteria"
    },
    {
      title: "Google's Gemma 1.5 2B: A Tiny AI Model, Huge Potential",
      summary: "The new open-source model can run on smartphones, offering efficiency and functionality for academic and indie developers alike.",
      date: "August 20, 2025",
      slug: "google-gemma-tiny-ai-model"
    },
    {
      title: "Meta Releases DINOX: Image Analysis Model Commercially",
      summary: "AI model trained on 1.2 billion images and can detect various tasks with little adaptation.",
      date: "August 19, 2025",
      slug: "meta-dinox-image-analysis"
    },
    // Add more articles as needed
    {
      title: "OpenAI's GPT-5: What to Expect from the Next Big Thing",
      summary: "Speculations and insights on the features and capabilities of the upcoming GPT-5",
      date: "August 18, 2025",
      slug: "openai-gpt5-expectations"
    },
    {
      title: "Anthropic's Claude 3: A Leap Towards Safer AI",
      summary: "Exploring the advancements in safety and reliability in Anthropic's latest AI model release.",
      date: "August 17, 2025",
      slug: "anthropic-claude3-safety"  
    },
    {
      title: "AI in Healthcare: Transforming Patient Care with Machine Learning",
      summary: "How AI is revolutionizing diagnostics, treatment plans, and patient monitoring in modern healthcare.",
      date: "August 16, 2025",
      slug: "ai-healthcare-transformation"
    }
  ];

  // Rex testimonials
  const rexTestimonials = [
    {
      quote: "I used to spend hours reading research papers. Now Rex delivers the key insights in minutes!",
      author: "Dr. Sarah Chen",
      role: "AI Research Lead, TechCorp",
      rex: "🦕"
    },
    {
      quote: "RecursivAI keeps our team ahead of the curve. It's like having an AI research assistant.",
      author: "Marcus Rodriguez",
      role: "CTO, StartupAI",
      rex: "🦕"
    },
    {
      quote: "The daily summaries are perfect for busy executives who need to stay informed on AI.",
      author: "Jennifer Park",
      role: "VP Strategy, Fortune 500",
      rex: "🦕"
    }
  ];

  return (
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
                {/* <nav className="mb-1 font-body">
                  <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">News</Link>
                  <Link href="/" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Research</Link>
                  <Link href="/curated" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Curated</Link>
                  <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">About</Link>
                </nav> */}
                <h1 className="text-7xl font-serif font-black">
                  RecursivAI
                </h1>
                {/* <p className="text-center text-base italic font-serif text-gray-700 mt-1 mb-4">
                  Who better to keep up with AI than AI itself?
                </p> */}
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
          
          {/* Hero Section - Newsletter-style */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Main Feature */}
            <div className="md:col-span-7 border-r border-gray-300 pr-6">
              <div className="mb-6">
                <h2 className="text-4xl font-serif font-bold mb-4 leading-tight">
                  🦕 Get Smarter About AI Every Day with Rex
                </h2>
                <p className="text-lg mb-4 news-content dropcap font-serif">
                  Meet Rex, your friendly neighborhood AI curator! This tech-savvy dinosaur has evolved beyond extinction to become the ultimate AI news hunter. Rex scans thousands of research papers, industry reports, and breakthrough announcements daily, so you don't have to.
                </p>
                {/* <div className="mb-6 border-l-4 border-gray-400 pl-4 bg-gray-50 p-4">
                  <p className="text-base font-serif italic">
                    "I may be a dinosaur, but I'm definitely not extinct when it comes to AI! Let me be your guide through the rapidly evolving world of artificial intelligence." <strong>- Rex 🦕</strong>
                  </p>
                </div> */}
                <div className="mb-6">
                  <p className="text-base font-serif mb-4">
                    <strong>Join 220+ professionals</strong> who wake up to Rex's carefully curated AI insights. From groundbreaking research to industry shake-ups, Rex delivers only what matters most to your inbox.
                  </p>
                </div>
                
                {/* Newsletter Signup */}
                <div className="border-2 border-gray-400 p-6 bg-white shadow-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">🦕</span>
                    <h3 className="text-xl font-serif font-bold">Subscribe to Rex's Daily AI Digest</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-base font-serif"
                      required
                    />
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-black text-white font-serif font-bold hover:bg-gray-800 transition-colors"
                    >
                      Join Rex's Pack!
                    </button>
                  </div>
                  {isSubscribed && (
                    <div className="p-3 bg-green-100 text-green-800 font-serif border border-green-300">
                      🦕 ✓ Roar-some! Rex is excited to share AI insights with you! Check your email.
                    </div>
                  )}
                  <p className="text-sm text-gray-600 font-serif">
                    Free forever • Daily at 7 AM • Unsubscribe anytime • No spam, Rex promises! 🦕
                  </p>
                </div>
              </div>


          {/* How Rex Works - Comic Strip Style */}
          <div className="border-t border-gray-300 pt-6 mb-8">
            <h3 className="text-2xl font-serif font-bold mb-2 text-center">📚 Rex's Daily Routine: Behind the Scenes</h3>
            <p className="text-center text-sm font-serif italic text-gray-600 mb-6">A day in the life of your AI curator</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center border border-gray-300 p-4 bg-white">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <div className="text-4xl mb-2">🌅</div>
                  <div className="text-xs font-serif text-gray-500">5:00 AM</div>
                </div>
                <h4 className="text-base font-serif font-bold mb-2">Early Bird Gets the Papers</h4>
                <p className="text-xs font-serif text-gray-700">Rex starts scanning ArXiv, Google Scholar, and industry blogs while you sleep</p>
              </div>
              <div className="text-center border border-gray-300 p-4 bg-white">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <div className="text-4xl mb-2">🧠</div>
                  <div className="text-xs font-serif text-gray-500">6:00 AM</div>
                </div>
                <h4 className="text-base font-serif font-bold mb-2">Analysis & Ranking</h4>
                <p className="text-xs font-serif text-gray-700">Rex's AI brain processes everything and ranks by importance and impact</p>
              </div>
              <div className="text-center border border-gray-300 p-4 bg-white">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <div className="text-4xl mb-2">✍️</div>
                  <div className="text-xs font-serif text-gray-500">6:30 AM</div>
                </div>
                <h4 className="text-base font-serif font-bold mb-2">Translation Magic</h4>
                <p className="text-xs font-serif text-gray-700">Complex jargon becomes simple, digestible insights for busy humans</p>
              </div>
              <div className="text-center border border-gray-300 p-4 bg-white">
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <div className="text-4xl mb-2">📧</div>
                  <div className="text-xs font-serif text-gray-500">7:00 AM</div>
                </div>
                <h4 className="text-base font-serif font-bold mb-2">Perfect Timing</h4>
                <p className="text-xs font-serif text-gray-700">Your curated AI digest arrives exactly when you need your morning intelligence</p>
              </div>
            </div>
          </div>


            </div>

            {/* Rex Character Spotlight */}
            <div className="md:col-span-5">
              <div className=" mb-6">
                <div class="text-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Character Spotlight</h3>
                </div>
                <div className="text-center mb-4">
                  {/* <div className="text-8xl mb-4">🦕</div> */}
                  <img src="images/rex.png" alt="Rex the AI Curator" width={300} height={300} className="mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold mb-2">Rex the AI Curator</h3>
                  <p className="text-sm font-serif italic text-gray-600 mb-4">
                    "The most evolved dinosaur in tech"
                  </p>
                </div>
                <div className="text-left space-y-3 text-sm font-serif">
                  <p><strong>Species:</strong> Technosaurus Rex</p>
                  <p><strong>Habitat:</strong> The vast digital research landscape</p>
                  <p><strong>Diet:</strong> Fresh AI papers, breaking news, and industry insights</p>
                  <p><strong>Special Skills:</strong> Speed-reading 10,000 articles per minute, detecting AI hype vs. reality</p>
                  <p><strong>Mission:</strong> Making AI accessible to humans, one newsletter at a time</p>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-serif italic text-center">
                    💡 <strong>Fun Fact:</strong> Rex processes information 1000x faster than humans but still takes coffee breaks! ☕
                  </p>
                </div>
              </div>
              
              {/* Quick Stats Box */}
              <div className="">
                <h4 className="text-lg font-serif font-bold mb-3 text-center border-b pb-2">Rex's Daily Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm font-serif">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-gray-600">Papers Scanned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">89</div>
                    <div className="text-gray-600">News Sources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-gray-600">Key Insights</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">220+</div>
                    <div className="text-gray-600">Happy Readers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="border-t-2 border-double border-gray-400 mb-6 pt-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">🔥 What's Hot in AI Today</h4>
          </div>

          {/* Sample Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 mb-8">
            {featuredArticles.map((post, index) => (
              <div
                key={post.slug}
                className={`pb-4 md:px-3 ${index % 3 !== 0 ? 'md:border-l md:border-gray-300' : ''}`}
              >
                <div className="aspect-[16/9] mb-3 overflow-hidden relative bg-gradient-to-br from-blue-100 to-cyan-100 border border-gray-300">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">{index === 0 ? '🧬' : index === 1 ? '📱' : '🖼️'}</div>
                      <div className="text-sm font-serif text-gray-600">Curated by Rex</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-serif font-bold mb-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm mb-2 news-content font-serif">{post.summary}</p>
                <p className="text-xs text-gray-500 italic font-serif">
                  {post.date} • Analyzed by 🦕
                </p>
              </div>
            ))}
          </div>

          {/* Rex's AI Stock Market Parody */}
          <div className="border-t border-gray-300 pt-6 mb-8">
            <h3 className="text-2xl font-serif font-bold mb-6 text-center">🎯 Rex's Hype-o-Meter</h3>
            <p className="text-center font-serif text-gray-600 mb-6 italic">
              Rex has a special talent for separating genuine breakthroughs from marketing fluff
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-red-300 p-6 bg-red-50">
                <div className="text-center mb-4">
                  <span className="text-4xl">⚠️</span>
                  <h4 className="text-xl font-serif font-bold text-red-700">Hype Alert</h4>
                </div>
                <ul className="space-y-2 text-sm font-serif">
                  <li>• "AGI is here!" announcements (weekly 🙄)</li>
                  <li>• Another "ChatGPT killer" with 0.1% improvement</li>
                  <li>• AI will replace all jobs by next Tuesday</li>
                  <li>• Breakthrough that's just a minor parameter tweak</li>
                </ul>
                <p className="text-xs font-serif italic mt-3 text-center text-red-600">
                  Rex rolls his eyes at these daily 🦕👀
                </p>
              </div>
              <div className="border border-green-300 p-6 bg-green-50">
                <div className="text-center mb-4">
                  <span className="text-4xl">✅</span>
                  <h4 className="text-xl font-serif font-bold text-green-700">Real Deal</h4>
                </div>
                <ul className="space-y-2 text-sm font-serif">
                  <li>• Peer-reviewed research with reproducible results</li>
                  <li>• Major model architecture innovations</li>
                  <li>• Practical applications solving real problems</li>
                  <li>• Strategic industry moves that matter</li>
                </ul>
                <p className="text-xs font-serif italic mt-3 text-center text-green-600">
                  This gets Rex's prehistoric heart pumping! 🦕❤️
                </p>
              </div>
            </div>
          </div>

          
       {/* Reader Testimonials - Newspaper Style */}
          <div className="border-t-2 border-double border-gray-400 pt-6 mb-8">
            <h3 className="text-2xl font-serif font-bold mb-6 text-center">📰 What Rex's Readers Are Saying</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rexTestimonials.map((testimonial, index) => (
                <div key={index} className="border border-gray-400 p-4 bg-white">
                  <div className="text-center mb-3">
                    <span className="text-3xl">{testimonial.rex}</span>
                  </div>
                  <blockquote className="text-sm font-serif italic mb-3 text-center">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="text-center">
                    <div className="font-serif font-bold text-sm">{testimonial.author}</div>
                    <div className="text-xs text-gray-600 font-serif">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Final CTA - Newspaper Ad Style */}
          <div className="border-4 border-double border-black p-8 bg-white text-center mb-8">
            <div className="border-b-2 border-gray-300 pb-4 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Limited Time Offer</h3>
              <h2 className="text-3xl font-serif font-black mb-2">FREE LIFETIME SUBSCRIPTION</h2>
              <p className="text-lg font-serif">To Rex's Daily AI Intelligence Report</p>
            </div>
            
            <div className="flex justify-center items-center mb-6">
              <div className="text-6xl mr-4">🦕</div>
              <div className="text-left">
                <h3 className="text-xl font-serif font-bold">Join Rex's Growing Pack!</h3>
                <p className="font-serif">220+ AI professionals can't be wrong</p>
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
              "Don't let AI evolution leave you behind like it did my fellow dinosaurs!" - Rex 🦕
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
  );
};

export default LandingPage;