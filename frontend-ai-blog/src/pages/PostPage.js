import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatters";
import { getPostBySlug } from "../utils/apiService";
import MarkdownRenderer from '../components/MarkdownRenderer';
import SEO from "../components/SEO";

// Style constants
const GEORGIA_FONT = { fontFamily: 'Georgia, "Times New Roman", serif' };

// Theme configurations
const getTheme = (isNewsPost) => {
  if (isNewsPost) {
    return {
      pageClass: "newspaper-page bg-[#FAF9F5] min-h-screen",
      containerClass: "text-black",
      titleClass: "text-black font-serif",
      dateClass: "text-gray-600 font-serif",
      cardClass: "bg-gray-100 p-4 rounded-lg mb-8 border border-gray-300",
      textClass: "text-gray-700 font-serif",
      linkClass: "text-blue-600",
      contentClass: "prose prose-lg max-w-none mb-12 text-black prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-a:text-blue-600 prose-headings:font-serif",
      buttonClass: "px-6 py-3 bg-gray-800 text-white hover:bg-gray-700 transition-colors font-serif rounded mb-8",
      errorContainer: "bg-white p-6 rounded-lg border border-gray-300 text-black",
      errorTitle: "text-black text-xl mb-4 font-serif",
      errorText: "text-gray-700 mb-6 font-serif",
      errorButton: "px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors font-serif"
    };
  }
  
  return {
    pageClass: "",
    containerClass: "",
    titleClass: "text-white",
    dateClass: "text-gray-400",
    cardClass: "bg-cyber-dark p-4 rounded-lg mb-8",
    textClass: "text-gray-400",
    linkClass: "text-cyber-neon",
    contentClass: "prose prose-invert max-w-none mb-12",
    buttonClass: "cyber-btn-pink mb-8",
    errorContainer: "bg-cyber-dark p-6 rounded-lg border border-cyber-pink",
    errorTitle: "text-cyber-pink text-xl mb-4",
    errorText: "text-gray-300 mb-6",
    errorButton: "cyber-btn-pink mb-8"
  };
};

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const postData = await getPostBySlug(slug);
        setPost(postData);
        setError(null);

        // Scroll to top when post loads
        window.scrollTo(0, 0);
      } catch (err) {
        console.error(`Failed to fetch post with slug ${slug}:`, err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Handle back button
  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <>
        <SEO
          title="Loading... | RecursivAI"
          description="An AI-powered blog exploring cutting-edge research papers in tech and machine learning"
        />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-cyber-neon animate-pulse">
            Loading analysis...
          </div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <SEO
          title="Post Not Found | RecursivAI"
          description="The requested AI analysis could not be found"
        />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-pink">
              <h2 className="text-cyber-pink text-xl mb-4">
                Error Loading Post
              </h2>
              <p className="text-gray-300 mb-6">
                {error?.message || "The requested post could not be found."}
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

  // Now we can safely check post type after confirming post exists
  const isNewsPost = post.ai_metadata?.post_type === "news";
  const theme = getTheme(isNewsPost);

  return (
    <>
      {/* Native Metadata Support in React 19 */}
      <title>{`${post.title} | RecursivAI`}</title>
      <meta
        name="description"
        content={post.summary || "AI-powered analysis of machine learning research"}
      />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.summary} />
      <meta property="og:image" content={post.image} />
      <meta property="og:url" content={`https://recursivai.vercel.app/post/${post.slug}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.summary} />
      <meta name="twitter:image" content={post.image} />
  
      <div className={theme.pageClass}>
        <div className={`container mx-auto px-4 py-16 ${theme.containerClass}`}>
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-3xl font-bold mb-4 ${theme.titleClass}`}>
              {post.title}
            </h1>
    
            <div className={`text-sm mb-8 ${theme.dateClass}`}>
              {formatDate(post.created_at)}
            </div>

            {/* Featured Image for News Posts */}
            {isNewsPost && post.featured_image_url && (
              <div className="mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg border border-gray-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Paper Info */}
            {post.ai_metadata?.paper_id && (
              <div className={theme.cardClass}>
                <div className={`text-sm ${theme.textClass}`}>
                  Based on paper:
                  <a
                    href={`https://arxiv.org/abs/${post.ai_metadata.paper_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-2 hover:underline ${theme.linkClass}`}
                  >
                    {post.ai_metadata.paper_id}
                  </a>
                </div>
              </div>
            )}
    
            {/* News Source Info */}
            {isNewsPost && post.ai_metadata.original_article_url && (
              <div className={theme.cardClass}>
                <div className={`text-sm ${theme.textClass}`}>
                  Original Source:
                  <a
                    href={post.ai_metadata.original_article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-2 hover:underline ${theme.linkClass}`}
                  >
                    {post.ai_metadata.original_article_source || "Source"}
                  </a>
                </div>
              </div>
            )}
    
            {/* Post content */}
            <div 
              className={theme.contentClass}
              style={isNewsPost ? GEORGIA_FONT : {}}
            >
              {post.content && post.content.body ? (
                <MarkdownRenderer>
                  {post.content.body}
                </MarkdownRenderer>
              ) : (
                <p 
                  className={isNewsPost ? "text-gray-700 text-lg" : "text-gray-400"}
                  style={isNewsPost ? GEORGIA_FONT : {}}
                >
                  No content available for this post.
                </p>
              )}
            </div>
    
            {/* Back button */}
            <button onClick={goBack} className={theme.buttonClass}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
  
};

export default PostPage;
