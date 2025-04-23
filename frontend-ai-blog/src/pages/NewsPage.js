import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllPosts } from "../utils/apiService";
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

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getAllPosts({ limit: 9, post_types: "regular" });
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

  if (loading) return <div className="text-center py-10">Loading posts...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  // Separate posts for different sections
  const mainFeature = posts[0];
  const secondaryFeatures = posts.slice(1, 3);
  const remainingPosts = posts.slice(3, 9);

  return (
    // Added a news-page-container class for targeting in CSS
    <div className="news-page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200">
        <div className="grid grid-cols-3 items-center py-3">
          <div className="text-s">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <h1 className="text-3xl font-serif font-bold text-center">
            RecursivAI
          </h1>
        </div>
      </header>

      <main className="py-4">
        {/* Top Stories */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Main Feature */}
          {mainFeature && (
            <div className="md:col-span-8 border-b pb-4 md:border-b-0 md:border-r md:pr-4">
              <Link to={`/post/${mainFeature.slug}`}>
                <div className="aspect-w-16 aspect-h-9 mb-3 overflow-hidden">
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
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h2 className="text-2xl font-serif font-bold mb-1">
                  {mainFeature.title}
                </h2>
                <p className="text-base mb-1">{mainFeature.summary}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(mainFeature.created_at)}
                </p>
              </Link>
            </div>
          )}

          {/* Secondary Features */}
          <div className="md:col-span-4">
            {secondaryFeatures.map((post, index) => (
              <Link key={post.slug} to={`/post/${post.slug}`}>
                <div className={`${index !== 0 ? "border-t pt-3 mt-3" : ""}`}>
                  <div className="aspect-w-16 aspect-h-9 mb-2 overflow-hidden">
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
                        className="w-full h-full object-cover bg-gray-200"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-bold mb-1">
                    {post.title}
                  </h3>
                  <p className="text-sm mb-1">{post.summary}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Remaining Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t pt-4">
          {remainingPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/post/${post.slug}`}
              className="border-b pb-3"
            >
              <div className="aspect-w-16 aspect-h-9 mb-2 overflow-hidden">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getPlaceholderImage(remainingPosts.indexOf(post) + 3)}
                    alt="Image placeholder"
                    className="w-full h-full object-cover bg-gray-200"
                  />
                )}
              </div>
              <h3 className="text-lg font-serif font-bold mb-1">
                {post.title}
              </h3>
              <p className="text-sm mb-1">{post.summary}</p>
              <p className="text-xs text-gray-500">
                {formatDate(post.created_at)}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NewsPage;