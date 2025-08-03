import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import SEO from "../components/SEO";

export default function Custom404() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    setTimestamp(new Date().toISOString());
  }, []);
  return (
    <>
      <SEO
        title="Page Not Found | RecursivAI"
        description="The requested page could not be found. Explore our AI research and technology insights instead."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-gray">
        {/* Cyberpunk scanlines effect */}
        <div className="scanlines"></div>
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* 404 Animation */}
            <div className="mb-8">
              <h1 className="text-8xl md:text-9xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyber-neon via-cyber-pink to-cyber-purple animate-pulse mb-4">
                404
              </h1>
              <div className="flex justify-center mb-6">
                <div className="w-32 h-1 bg-cyber-pink relative">
                  <div className="absolute top-0 left-0 w-full h-full opacity-70" style={{ boxShadow: "0 0 15px 3px #ff00ff" }}></div>
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="bg-cyber-dark/80 backdrop-blur-sm p-8 rounded-lg border border-cyber-pink/30 relative overflow-hidden mb-8">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-cyber-pink opacity-5"></div>
              
              <div className="relative z-10">
                <h2 className="text-cyber-pink text-2xl md:text-3xl mb-4 font-cyber">
                  Neural Network Error
                </h2>
                <p className="text-gray-300 text-lg mb-6 font-body">
                  The AI couldn't locate the requested resource in the knowledge base. 
                  The page you're looking for might have been moved, deleted, or never existed.
                </p>
                <p className="text-gray-400 mb-8 font-body">
                  But don't worry - there's plenty of fascinating AI research and insights to explore!
                </p>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Latest Research */}
              <div className="bg-cyber-dark/60 p-6 rounded-lg border border-cyber-neon/30 hover:border-cyber-neon/60 transition-all duration-300">
                <div className="text-cyber-neon text-xl font-cyber mb-3 neon-text-cyan">
                  Latest Research
                </div>
                <p className="text-gray-400 mb-4 font-body">
                  Explore cutting-edge AI research and breakthroughs
                </p>
                <Link href="/">
                  <button className="cyber-btn-neon w-full">
                    Explore Research
                  </button>
                </Link>
              </div>

              {/* Curated Papers */}
              <div className="bg-cyber-dark/60 p-6 rounded-lg border border-amber-400/30 hover:border-amber-400/60 transition-all duration-300">
                <div className="text-amber-400 text-xl font-cyber mb-3">
                  Foundational Papers
                </div>
                <p className="text-gray-400 mb-4 font-body">
                  Dive into the research that shaped modern AI
                </p>
                <Link href="/curated">
                  <button className="px-6 py-3 bg-amber-400 text-cyber-black hover:bg-amber-300 transition-colors font-cyber rounded w-full">
                    View Curated
                  </button>
                </Link>
              </div>
            </div>

            {/* Additional Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/news">
                <button className="cyber-btn-outline px-6 py-3 font-cyber">
                  AI News
                </button>
              </Link>
              
              <Link href="/about">
                <button className="cyber-btn-pink px-6 py-3 font-cyber">
                  About RecursivAI
                </button>
              </Link>
            </div>

            {/* Technical Details */}
            <div className="mt-12 p-4 bg-cyber-black/40 rounded border border-cyber-gray text-left font-mono text-sm">
              <div className="text-cyber-neon mb-2">Error Details:</div>
              <div className="text-gray-400">
                Status: 404 - Resource Not Found<br/>
                {currentPath && (
                  <>Location: {currentPath}<br/></>
                )}
                {timestamp && (
                  <>Timestamp: {timestamp}<br/></>
                )}
                Suggestion: Navigate to valid endpoints
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}