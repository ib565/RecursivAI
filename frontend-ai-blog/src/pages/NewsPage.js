import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNewsPosts } from "../utils/apiService";
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

const NUM_POSTS_TO_FETCH = 12;

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getNewsPosts({ limit: NUM_POSTS_TO_FETCH });
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-10 bg-white text-black">Loading posts...</div>;
  if (error)
    return <div className="text-center py-10 bg-white text-red-600">{error}</div>;

  // Separate posts for different sections
  const mainFeature = posts[0];
  const secondaryFeatures = posts.slice(1, 3);
  const remainingPosts = posts.slice(3, NUM_POSTS_TO_FETCH);

  return (
    <div className="w-full bg-white">
      <div className="newspaper-page min-h-screen w-full bg-white text-black transform scale-90 origin-top mx-auto">
        {/* Header/Navigation */}
        <header className="pt-8 pb-4 bg-white">
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
              <h1 className="text-5xl font-serif font-black text-center flex-grow my-4">
                RecursivAI
              </h1>
              <div className="text-s invisible">
                {/* Empty div for flex spacing */}
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            {/* Tagline */}
            <p className="text-center text-base italic font-serif text-gray-700 -mt-2 mb-4">
              Who better to keep up with AI than AI itself?
            </p>
          </div>
        </header>

        <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black">
          {/* Top Stories */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Main Feature */}
            {mainFeature && (
              <div className="md:col-span-8 border-b pb-6 md:border-b-0 md:border-r md:pr-6 border-gray-300">
                <Link to={`/post/${mainFeature.slug}`}>
                  <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden">
                    {mainFeature.image ? (
                      <img
                        src={mainFeature.image}
                        alt={mainFeature.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={getPlaceholderImage(0)}
                        alt="Featured image placeholder"
                        className="w-full h-full object-cover grayscale"
                      />
                    )}
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-3 leading-tight">
                    {mainFeature.title}
                  </h2>
                  <p className="text-base mb-2 font-serif dropcap">{mainFeature.summary}</p>
                  <p className="text-xs text-gray-500 italic">
                    {formatDate(mainFeature.created_at)}
                  </p>
                </Link>
              </div>
            )}

            {/* Secondary Features */}
            <div className="md:col-span-4">
              {secondaryFeatures.map((post, index) => (
                <Link key={post.slug} to={`/post/${post.slug}`}>
                  <div className={`${index !== 0 ? "border-t pt-4 mt-4 border-gray-300" : ""}`}>
                    <div className="aspect-w-16 aspect-h-9 mb-3 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={getPlaceholderImage(index + 1)}
                          alt="Image placeholder"
                          className="w-full h-full object-cover grayscale"
                        />
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm mb-2 font-serif">{post.summary}</p>
                    <p className="text-xs text-gray-500 italic">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </Link>
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
              <Link
                key={post.slug}
                to={`/post/${post.slug}`}
                className={`pb-4 ${index % 3 !== 2 ? "md:border-r md:pr-6 border-gray-300" : ""}`}
              >
                <div className="aspect-w-16 aspect-h-9 mb-3 overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getPlaceholderImage(index + 3)}
                      alt="Image placeholder"
                      className="w-full h-full object-cover grayscale"
                    />
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold mb-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm mb-2 font-serif">{post.summary}</p>
                <p className="text-xs text-gray-500 italic">
                  {formatDate(post.created_at)}
                </p>
              </Link>
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
    </div>
  );
};

export default NewsPage;