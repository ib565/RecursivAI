import React from 'react';
import PostCard from './PostCard';

const PostGrid = ({ posts, loading, error }) => {
  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-cyber-neon animate-pulse">
          Loading posts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-cyber-pink p-6 rounded-lg border border-cyber-pink">
          Error: {error.message || 'Failed to load posts'}
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-gray-400 p-6 rounded-lg border border-gray-700">
          No posts available yet. Check back soon.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostGrid;