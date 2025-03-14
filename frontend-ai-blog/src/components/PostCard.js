import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

const PostCard = ({ post }) => {
  return (
    <Link to={`/post/${post.slug}`} className="block h-full">
      <article className="cyber-card hover:translate-y-[-4px] h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-white hover:text-cyber-neon line-clamp-3">
          {post.title}
        </h2>
        
        <div className="text-gray-400 text-sm mb-4">
          {formatDate(post.created_at)}
        </div>
        
        <p className="text-gray-300 mb-4 line-clamp-5 flex-grow">
          {post.summary}
        </p>
        
        <div className="text-cyber-neon text-sm hover:underline mt-auto">
          Read analysis →
        </div>
      </article>
    </Link>
  );
};

export default PostCard;