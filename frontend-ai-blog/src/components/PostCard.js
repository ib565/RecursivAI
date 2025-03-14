import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

const PostCard = ({ post }) => {
  // Check if this is a weekly summary post
  const isWeeklySummary = post.ai_metadata?.post_type === "weekly_summary";
  
  return (
    <Link to={`/post/${post.slug}`} className="block h-full">
      <article className={`cyber-card hover:translate-y-[-4px] h-full flex flex-col ${isWeeklySummary ? 'border-cyber-pink' : 'border-cyber-neon'}`}
        style={{
          boxShadow: isWeeklySummary ? '0 0 10px rgba(255, 0, 255, 0.15)' : '0 0 10px rgba(0, 255, 255, 0.15)'
        }}>
        <h2 className={`text-xl font-bold mb-2 text-white hover:${isWeeklySummary ? 'text-cyber-pink' : 'text-cyber-neon'} line-clamp-3`}>
          {post.title}
        </h2>
        
        <div className="text-gray-400 text-sm mb-4">
          {formatDate(post.created_at)}
        </div>
        
        <p className="text-gray-300 mb-4 line-clamp-5 flex-grow">
          {post.summary}
        </p>
        
        <div className={`${isWeeklySummary ? 'text-cyber-pink' : 'text-cyber-neon'} text-sm hover:underline mt-auto`}>
          Read analysis →
        </div>
      </article>
    </Link>
  );
};