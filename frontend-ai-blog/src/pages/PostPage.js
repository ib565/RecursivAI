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
      <meta property="og:url" content={`https://recursivai.com/blog/${post.slug}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.summary} />
      <meta name="twitter:image" content={post.image} />
  
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-white">{post.title}</h1>
  
          <div className="text-gray-400 text-sm mb-8">
            {formatDate(post.created_at)}
          </div>
  
          {/* Paper Info */}
          {post.ai_metadata?.paper_id && (
            <div className="bg-cyber-dark p-4 rounded-lg mb-8">
              <div className="text-sm text-gray-400">
                Based on paper:
                <a
                  href={`https://arxiv.org/abs/${post.ai_metadata.paper_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-cyber-neon hover:underline"
                >
                  {post.ai_metadata.paper_id}
                </a>
              </div>
            </div>
          )}
  
          {/* Post content */}
          <div className="prose prose-invert max-w-none mb-12">
            {post.content && post.content.body ? (
              <MarkdownRenderer>
                {post.content.body}
              </MarkdownRenderer>
            ) : (
              <p className="text-gray-400">
                No content available for this post.
              </p>
            )}
          </div>
  
          {/* Back button */}
          <button onClick={goBack} className="cyber-btn-pink mb-8">
            ← Back
          </button>
        </div>
      </div>
    </>
  );
  
};

export default PostPage;
