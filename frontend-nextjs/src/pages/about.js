import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MarkdownRenderer from "../components/MarkdownRenderer";
import SEO from "../components/SEO";

const AboutPage = () => {
  const router = useRouter();
  const [markdownContent, setMarkdownContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarkdownContent = async () => {
      try {
        setLoading(true);
        const response = await fetch("/content/about.md");
        if (!response.ok) {
          throw new Error("Failed to load about content");
        }
        const content = await response.text();
        setMarkdownContent(content);
        setError(null);
      } catch (err) {
        console.error("Error loading about content:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdownContent();
  }, []);

  const goBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <SEO
          title="About | RecursivAI"
          description="Learn about RecursivAI - An AI-powered blog exploring cutting-edge research"
        />
        <div className="w-full bg-[#FAF9F5]">
          <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
            
            {/* Loading Content */}
            <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">🦕</div>
                  <p className="text-lg font-serif text-gray-600">Loading content...</p>
                </div>
              </div>
            </main>

          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title="About | RecursivAI"
          description="Learn about RecursivAI - An AI-powered blog exploring cutting-edge research"
        />
        <div className="w-full bg-[#FAF9F5]">
          <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
            
            {/* Error Content */}
            <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
              <div className="max-w-4xl mx-auto text-center py-16">
                <div className="mb-8">
                  <div className="text-8xl mb-4">🦕</div>
                  <h2 className="text-3xl font-serif font-bold mb-4 text-red-600">
                    About Page Temporarily Unavailable!
                  </h2>
                  <p className="text-lg font-serif text-gray-700 mb-6">
                    Rex is having trouble loading the about page content. Even AI curators have technical difficulties!
                  </p>
                </div>
                
                <div className="border-2 border-red-300 p-8 bg-red-50 mb-8">
                  <h3 className="text-xl font-serif font-bold mb-4 text-red-700">
                    What happened?
                  </h3>
                  <div className="text-left space-y-3 text-sm font-serif text-gray-700">
                    <p>• The about page content might be taking a coffee break ☕</p>
                    <p>• The content pipeline could be temporarily down</p>
                    <p>• Network connectivity issues (even Rex can&apos;t fix everything!)</p>
                    <p>• Content maintenance or updates in progress</p>
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
                  <button
                    onClick={goHome}
                    className="px-6 py-3 bg-green-600 text-white font-serif font-bold hover:bg-green-700 transition-colors border-2 border-green-600"
                  >
                    🏠 Go Home
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
        title="About | RecursivAI"
        description="Learn about RecursivAI - An AI-powered blog that uses artificial intelligence to research AI, bringing you clear insights into cutting-edge machine learning research and technology breakthroughs."
        keywords="AI, artificial intelligence, research, blog, machine learning, technology, automation, RecursivAI"
      />
      
      <div className="w-full bg-[#FAF9F5]">
        <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
          

          {/* Main Content */}
          <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-black mb-6 text-black">
                About the project
              </h1>
              <div className="flex justify-center mb-8">
                <div className="w-32 h-1 bg-black"></div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white p-8 rounded-lg border-2 border-black relative overflow-hidden mb-12">
              <div className="prose prose-lg max-w-none">
                {markdownContent ? (
                  <MarkdownRenderer>
                    {markdownContent}
                  </MarkdownRenderer>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-lg font-serif">
                      Content is loading...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={goBack}
                  className="px-8 py-3 border-2 border-black text-black font-serif font-bold hover:bg-black hover:text-white transition-all duration-300"
                >
                  ← Back
                </button>
                
                <button 
                  onClick={goHome}
                  className="px-8 py-3 bg-black text-white font-serif font-bold hover:bg-gray-800 transition-all duration-300"
                >
                  Explore Posts
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AboutPage;