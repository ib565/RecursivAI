import React, { useState, useEffect } from "react";
import PostGrid from "../components/PostGrid";
import { getAllPosts } from "../utils/apiService";
import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";

const CuratedPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const POSTS_PER_PAGE = 21;

  const fetchPosts = async (isInitialLoad = true, currentOffset = offset) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Fetch curated posts with the provided offset
      const data = await getAllPosts({
        post_types: "curated",
        limit: POSTS_PER_PAGE,
        offset: isInitialLoad ? 0 : currentOffset,
      });

      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      }

      if (isInitialLoad) {
        setPosts(data);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data]);
      }

      setError(null);
    } catch (err) {
      console.error("Failed to fetch curated posts:", err);
      setError(err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPosts();
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + POSTS_PER_PAGE;
    setOffset(newOffset);
    fetchPosts(false, newOffset);
  };

  return (
    <>
      <SEO
        title="The AI Canon - RecursivAI"
        description="A collection of the most influential and groundbreaking AI research papers that defined the field."
      />
      <div>
        {/* Enhanced Hero Section with gold accent */}
        <div className="relative bg-cyber-black py-16 overflow-hidden">
          {/* Background neural network pattern - subtle gold */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(#FFC107 1px, transparent 2px), radial-gradient(#FFC107 1px, transparent 2px)",
              backgroundSize: "50px 50px, 40px 40px",
              backgroundPosition: "0 0, 25px 25px",
            }}
          ></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-cyber font-bold mb-4">
                <span className="text-white">The AI </span>
                <span
                  style={{
                    color: "#FFC107",
                    textShadow:
                      "0 0 5px rgba(255, 193, 7, 0.7), 0 0 10px rgba(255, 193, 7, 0.5)",
                  }}
                >
                  Canon
                </span>
              </h1>

              {/* Gold divider for visual balance */}
              <div className="flex mb-6">
                <div
                  className="w-28 h-1 relative"
                  style={{ backgroundColor: "#FFC107" }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-full opacity-70"
                    style={{ boxShadow: "0 0 10px 2px #FFC107" }}
                  ></div>
                </div>
                <div
                  className="w-12 h-1 relative"
                  style={{ backgroundColor: "#FFD54F" }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-full opacity-70"
                    style={{ boxShadow: "0 0 10px 2px #FFC107" }}
                  ></div>
                </div>
              </div>

              <h2 className="text-xl font-cyber mb-6">
                <span
                  style={{
                    color: "#FFC107",
                    textShadow:
                      "0 0 5px rgba(255, 193, 7, 0.7), 0 0 10px rgba(255, 193, 7, 0.5)",
                  }}
                >
                  The algorithms that changed everything
                </span>
              </h2>

              <p className="text-gray-300 text-lg mb-8 font-body">
                This collection features the groundbreaking papers that
                fundamentally altered AI's trajectory - the mathematical and
                algorithmic innovations upon which modern systems are built.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate("/about")}
                  className="cyber-btn-pink mb-8"
                >
                  About
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="mb-8"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#0f0f12",
                    color: "#00ffff",
                    border: "1px solid #00ffff",
                    textShadow: "0 0 5px rgba(0, 255, 255, 0.5)",
                    boxShadow: "0 0 8px rgba(0, 255, 255, 0.2)",
                    transition: "all 0.3s",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  Latest Posts
                </button>
              </div>
            </div>
          </div>

          {/* Decorative elements - gold gradient */}
          <div className="absolute bottom-0 right-0 w-1/3 h-24 opacity-20 bg-gradient-to-r from-transparent via-amber-400 to-amber-300"></div>
        </div>

        {/* Posts Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <h2 className="text-2xl font-cyber font-bold mb-2">
              Landmark Papers
            </h2>
            {/* Gold accent for section head */}
            <div className="flex">
              <div
                className="w-12 h-1 relative"
                style={{ backgroundColor: "#FFD54F" }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-full opacity-70"
                  style={{ boxShadow: "0 0 10px 2px #FFC107" }}
                ></div>
              </div>
              <div
                className="w-20 h-1 relative"
                style={{ backgroundColor: "#FFC107" }}
              >
                <div
                  className="absolute top-0 left-0 w-full h-full opacity-70"
                  style={{ boxShadow: "0 0 10px 2px #FFC107" }}
                ></div>
              </div>
            </div>
          </div>

          <PostGrid posts={posts} loading={loading} error={error} />

          {/* Load More Button */}
          {!loading && !error && hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0f0f12",
                  color: "#FFC107",
                  border: "1px solid #FFC107",
                  textShadow: "0 0 5px rgba(255, 193, 7, 0.5)",
                  boxShadow: "0 0 8px rgba(255, 193, 7, 0.2)",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "'Share Tech Mono', monospace",
                }}
              >
                {loadingMore ? (
                  <>
                    <span className="animate-pulse">Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More</span>
                    <span className="text-xl">&#8659;</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CuratedPage;
