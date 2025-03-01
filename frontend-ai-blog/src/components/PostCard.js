import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/post/${post.slug}`} className="block">
      <article className="cyber-card hover:translate-y-[-4px]">
        <h2 className="text-xl font-bold mb-2 text-white hover:text-cyber-neon">
          {post.title}
        </h2>
        
        <div className="text-gray-400 text-sm mb-4">
          {formatDate(post.created_at)}
        </div>
        
        <p className="text-gray-300 mb-4">
          {post.summary}
        </p>
        
        <div className="text-cyber-neon text-sm hover:underline">
          Read analysis →
        </div>
      </article>
    </Link>
  );
};

export default PostCard;