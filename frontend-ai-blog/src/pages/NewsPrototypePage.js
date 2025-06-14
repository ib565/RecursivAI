import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNewsHeadlines } from "../utils/apiService";
import { formatDate } from "../utils/formatters";

const placeholderImages = [
  "/images/placeholder-1.jpeg",
  "/images/placeholder-2.jpg",
  "/images/placeholder-3.png",
  "/images/placeholder-4.jpg",
];

const getPlaceholderImage = (index) => {
  return placeholderImages[index % placeholderImages.length];
};

const NewsPrototypePage = () => {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  useEffect(() => {
    const controller = new AbortController();

    const fetchHeadlines = async () => {
      try {
        setLoading(true);
        const data = await getNewsHeadlines(controller.signal);
        setHeadlines(data);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching headlines:", err);
          setError("Failed to load headlines. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHeadlines();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) return <div className="text-center py-10 bg-white text-black">Loading headlines...</div>;
  if (error)
    return <div className="text-center py-10 bg-white text-red-600">{error}</div>;

  // Separate posts for different sections
  const mainFeature = headlines[0];
  const secondaryFeatures = headlines.slice(1, 3);
  const remainingPosts = headlines.slice(3, 9);

  return (
    <div className="newspaper-page min-h-screen w-full bg-white text-black">
      {/* Header/Navigation */}
      <header className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-wider text-center text-gray-500 mb-2">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <h1 className="text-5xl font-serif font-black text-center mb-4">
            RecursivAI Times
          </h1>
        </div>
      </header>

      <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-black">
        {/* Top Stories */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Main Feature */}
          {mainFeature && (
            <div className="md:col-span-8 border-b pb-6 md:border-b-0 md:border-r md:pr-6 border-gray-300">
              <a href={mainFeature.original_article.link} target="_blank" rel="noopener noreferrer">
                <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden">
                  <img
                    src={getPlaceholderImage(0)}
                    alt="Featured image placeholder"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <h2 className="text-3xl font-serif font-bold mb-3 leading-tight">
                  {mainFeature.headline}
                </h2>
                <p className="text-base mb-2 font-serif dropcap">{mainFeature.subheading}</p>
                <p className="text-xs text-gray-500 italic">
                  By Staff Reporter • {formatDate(mainFeature.original_article.published_date)}
                </p>
              </a>
            </div>
          )}

          {/* Secondary Features */}
          <div className="md:col-span-4">
            {secondaryFeatures.map((post, index) => (
              <a key={index} href={post.original_article.link} target="_blank" rel="noopener noreferrer">
                <div className={`${index !== 0 ? "border-t pt-4 mt-4 border-gray-300" : ""}`}>
                  <div className="aspect-w-16 aspect-h-9 mb-3 overflow-hidden">
                    <img
                      src={getPlaceholderImage(index + 1)}
                      alt="Image placeholder"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2 leading-tight">
                    {post.headline}
                  </h3>
                  <p className="text-sm mb-2 font-serif">{post.subheading}</p>
                  <p className="text-xs text-gray-500 italic">
                    {formatDate(post.original_article.published_date)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t border-gray-300 mb-6 pt-1">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Latest News</h4>
        </div>

        {/* Remaining Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {remainingPosts.map((post, index) => (
            <a
              key={index}
              href={post.original_article.link}
              target="_blank" rel="noopener noreferrer"
              className={`pb-4 ${index % 3 !== 2 ? "md:border-r md:pr-6 border-gray-300" : ""}`}
            >
              <div className="aspect-w-16 aspect-h-9 mb-3 overflow-hidden">
                <img
                  src={getPlaceholderImage(remainingPosts.indexOf(post) + 3)}
                  alt="Image placeholder"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <h3 className="text-lg font-serif font-bold mb-2 leading-tight">
                {post.headline}
              </h3>
              <p className="text-sm mb-2 font-serif">{post.subheading}</p>
              <p className="text-xs text-gray-500 italic">
                {formatDate(post.original_article.published_date)}
              </p>
            </a>
          ))}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-300 text-sm text-gray-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
          © {new Date().getFullYear()} RecursivAI Times. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default NewsPrototypePage; 