import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../utils/apiService'; // Adjust path as needed
import { formatDate } from '../utils/formatters'; // Create this helper or use a library

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getAllPosts({ limit: 9, post_types: 'regular' });
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-10">Loading posts...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  // Separate posts for different sections
  const mainFeature = posts[0];
  const secondaryFeatures = posts.slice(1, 3);
  const remainingPosts = posts.slice(3, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200">
        <div className="flex justify-between items-center py-4">
          <div className="text-sm">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-4xl font-serif font-bold text-center">RecursivAI</h1>
          <div className="invisible">Placeholder</div> {/* For centering the title */}
        </div>
        {/* <nav className="flex justify-center py-3 border-t border-b border-gray-200">
          <ul className="flex space-x-8">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
            <li><Link to="/" className="hover:underline font-bold">News</Link></li>
            <li><Link to="/curated" className="hover:underline">Curated</Link></li>
          </ul>
        </nav> */}
      </header>

      <main className="py-6">
        {/* Top Stories */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
          {/* Main Feature */}
          {mainFeature && (
            <div className="md:col-span-8 border-b pb-6 md:border-b-0 md:border-r md:pr-6">
              <Link to={`/post/${mainFeature.slug}`}>
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 mb-4">
                  {/* Placeholder for main image */}
                  <div className="flex items-center justify-center text-gray-400">
                    Featured Image
                  </div>
                </div>
                <h2 className="text-3xl font-serif font-bold mb-2">{mainFeature.title}</h2>
                <p className="text-lg mb-2">{mainFeature.summary}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(mainFeature.created_at)}
                </p>
              </Link>
            </div>
          )}

          {/* Secondary Features */}
          <div className="md:col-span-4">
            {secondaryFeatures.map((post, index) => (
              <Link key={post.slug} to={`/post/${post.slug}`}>
                <div className={`${index !== 0 ? 'border-t pt-4 mt-4' : ''}`}>
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 mb-3">
                    {/* Placeholder for secondary image */}
                    <div className="flex items-center justify-center text-gray-400">
                      Image
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-1">{post.title}</h3>
                  <p className="text-base mb-1">{post.summary}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(post.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Remaining Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6">
          {remainingPosts.map((post) => (
            <Link key={post.slug} to={`/post/${post.slug}`} className="border-b pb-4">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 mb-3">
                {/* Placeholder for grid image */}
                <div className="flex items-center justify-center text-gray-400">
                  Image
                </div>
              </div>
              <h3 className="text-lg font-serif font-bold mb-1">{post.title}</h3>
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