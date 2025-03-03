import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from '../components/MarkdownRenderer';
import SEO from "../components/SEO";

const AboutPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Fetch the markdown file from the public directory
        const response = await fetch('/content/about.md');
        if (!response.ok) {
          throw new Error(`Failed to fetch about page content: ${response.status}`);
        }
        const markdownContent = await response.text();
        setContent(markdownContent);
        setError(null);
        // Scroll to top when content loads
        window.scrollTo(0, 0);
      } catch (err) {
        console.error('Failed to fetch about page content:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Handle back button
  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <>
        <SEO
          title="Loading... | RecursivAI"
          description="About RecursivAI - An AI-powered blog exploring cutting-edge research papers in tech and machine learning"
        />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-cyber-neon animate-pulse">
            Loading...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title="Error | RecursivAI"
          description="About page could not be loaded"
        />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-pink">
              <h2 className="text-cyber-pink text-xl mb-4">
                Error Loading About Page
              </h2>
              <p className="text-gray-300 mb-6">
                {error?.message || "The about page content could not be loaded."}
              </p>
              <button onClick={goBack} className="cyber-btn-pink mb-8">
                ← Back
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
        description="About RecursivAI - An AI-powered blog exploring cutting-edge research papers in tech and machine learning"
      />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">          
          {/* About page content */}
          <div className="prose prose-invert max-w-none mb-12">
            {content ? (
              <MarkdownRenderer>
                {content}
              </MarkdownRenderer>
            ) : (
              <p className="text-gray-400">
                No content available for the about page.
              </p>
            )}
          </div>
          
          {/* Home button */}
          <button onClick={() => navigate('/')} className="cyber-btn-pink mb-8">
            Explore AI Research
          </button>
        </div>
      </div>
    </>
  );
};

export default AboutPage;