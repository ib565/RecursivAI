import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../utils/formatters";
import { getPostBySlug } from "../utils/apiService";
import MarkdownRenderer from '../components/MarkdownRenderer';
import SEO from "../components/SEO";

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

  // Check if this is a news post
  const isNewsPost = post?.ai_metadata?.post_type === "news";

  if (loading) {
    return (
      <>
        <SEO
          title="Loading... | RecursivAI"
          description="An AI-powered blog exploring cutting-edge research papers in tech and machine learning"
        />
        <div className={`min-h-screen pt-24 flex items-center justify-center ${isNewsPost ? 'bg-[#FAF9F5]' : ''}`}>
          <div className={isNewsPost ? "text-black animate-pulse" : "text-cyber-neon animate-pulse"}>
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
        <div className={`container mx-auto px-4 py-24 ${isNewsPost ? 'bg-[#FAF9F5] min-h-screen' : ''}`}>
          <div className="max-w-3xl mx-auto">
            <div className={isNewsPost 
              ? "bg-white p-6 rounded-lg border border-gray-300 text-black" 
              : "bg-cyber-dark p-6 rounded-lg border border-cyber-pink"
            }>
              <h2 className={isNewsPost 
                ? "text-black text-xl mb-4 font-serif" 
                : "text-cyber-pink text-xl mb-4"
              }>
                Error Loading Post
              </h2>
              <p className={isNewsPost 
                ? "text-gray-700 mb-6 font-serif" 
                : "text-gray-300 mb-6"
              }>
                {error?.message || "The requested post could not be found."}
              </p>
              <button onClick={goBack} className={isNewsPost 
                ? "px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors font-serif" 
                : "cyber-btn-pink mb-8"
              }>
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
  
      <div className={isNewsPost ? "newspaper-page bg-[#FAF9F5] min-h-screen" : ""}>
        <div className={`container mx-auto px-4 py-16 ${isNewsPost ? 'text-black' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-3xl font-bold mb-4 ${isNewsPost ? 'text-black font-serif' : 'text-white'}`}>
              {post.title}
            </h1>
    
            <div className={`text-sm mb-8 ${isNewsPost ? 'text-gray-600 font-serif' : 'text-gray-400'}`}>
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
              <div className={isNewsPost 
                ? "bg-gray-100 p-4 rounded-lg mb-8 border border-gray-300" 
                : "bg-cyber-dark p-4 rounded-lg mb-8"
              }>
                <div className={`text-sm ${isNewsPost ? 'text-gray-700 font-serif' : 'text-gray-400'}`}>
                  Based on paper:
                  <a
                    href={`https://arxiv.org/abs/${post.ai_metadata.paper_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-2 hover:underline ${isNewsPost ? 'text-blue-600' : 'text-cyber-neon'}`}
                  >
                    {post.ai_metadata.paper_id}
                  </a>
                </div>
              </div>
            )}
    
            {/* News Source Info */}
            {isNewsPost && post.ai_metadata.original_article_url && (
              <div className="bg-gray-100 p-4 rounded-lg mb-8 border border-gray-300">
                <div className="text-sm text-gray-700 font-serif">
                  Original Source:
                  <a
                    href={post.ai_metadata.original_article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {post.ai_metadata.original_article_source || "Source"}
                  </a>
                </div>
              </div>
            )}
    
            {/* Post content */}
            <div className={isNewsPost 
              ? "prose prose-lg max-w-none mb-12 text-black prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black prose-a:text-blue-600 prose-headings:font-serif" 
              : "prose prose-invert max-w-none mb-12"
            } style={isNewsPost ? { fontFamily: 'Georgia, "Times New Roman", serif' } : {}}>
              {post.content && post.content.body ? (
                <MarkdownRenderer>
                  {post.content.body}
                </MarkdownRenderer>
              ) : (
                <p className={isNewsPost ? "text-gray-700 text-lg" : "text-gray-400"} 
                   style={isNewsPost ? { fontFamily: 'Georgia, "Times New Roman", serif' } : {}}>
                  No content available for this post.
                </p>
              )}
            </div>
    
            {/* Back button */}
            <button 
              onClick={goBack} 
              className={isNewsPost 
                ? "px-6 py-3 bg-gray-800 text-white hover:bg-gray-700 transition-colors font-serif rounded mb-8" 
                : "cyber-btn-pink mb-8"
              }
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
  
};

export default PostPage;
