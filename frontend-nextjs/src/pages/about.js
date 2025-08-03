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
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-cyber-neon animate-pulse">
            Loading content...
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
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto bg-cyber-dark p-6 rounded-lg border border-cyber-pink relative">
            <div className="absolute inset-0 bg-cyber-pink opacity-5 animate-pulse"></div>
            <h2 className="text-cyber-pink text-xl mb-4 font-cyber neon-text-pink">
              Error Loading Content
            </h2>
            <p className="text-gray-300 mb-4">
              Unable to load the about page content. Please try again later.
            </p>
            <div className="flex space-x-4">
              <button onClick={goBack} className="cyber-btn-pink">
                ← Back
              </button>
              <button onClick={goHome} className="cyber-btn-neon">
                Go Home
              </button>
            </div>
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
      
      <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-gray">
        {/* Cyberpunk scanlines effect */}
        <div className="scanlines"></div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon via-cyber-pink to-cyber-purple mb-6">
                About RecursivAI
              </h1>
              <div className="flex justify-center mb-8">
                <div className="w-32 h-1 bg-cyber-neon relative">
                  <div className="absolute top-0 left-0 w-full h-full opacity-70" style={{ boxShadow: "0 0 10px 2px #00ffff" }}></div>
                </div>
                <div className="w-16 h-1 bg-cyber-pink relative">
                  <div className="absolute top-0 left-0 w-full h-full opacity-70" style={{ boxShadow: "0 0 10px 2px #ff00ff" }}></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-cyber-dark/80 backdrop-blur-sm p-8 rounded-lg border border-cyber-purple/30 relative overflow-hidden">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-neon/5 via-transparent to-cyber-pink/5"></div>
              
              <div className="relative z-10 prose prose-invert prose-lg max-w-none">
                {markdownContent ? (
                  <MarkdownRenderer>
                    {markdownContent}
                  </MarkdownRenderer>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-lg">
                      Content is loading...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={goBack}
                  className="cyber-btn-outline px-8 py-3 font-cyber transition-all duration-300"
                >
                  ← Back
                </button>
                
                <button 
                  onClick={goHome}
                  className="cyber-btn-neon px-8 py-3 font-cyber transition-all duration-300"
                >
                  Explore Posts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;