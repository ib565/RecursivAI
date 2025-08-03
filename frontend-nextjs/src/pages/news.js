import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getNewsPosts } from "../utils/apiService";
import { formatDate } from "../utils/formatters";
import SEO from "../components/SEO";

const placeholderImages = [
  "/images/placeholder-1.jpeg",
  "/images/placeholder-2.jpg",
  "/images/placeholder-3.png",
  "/images/placeholder-4.jpg",
];

const getPlaceholderImage = (index) => {
  return placeholderImages[index % placeholderImages.length];
};

const NUM_POSTS_TO_FETCH = 12;

export default function NewsPage({ initialPosts, error }) {
  const posts = initialPosts || [];
  const today = new Date();

  if (error) {
    return (
      <>
        <SEO
          title="AI News | RecursivAI"
          description="Latest AI and technology news analyzed by artificial intelligence"
        />
        <div className="text-center py-10 bg-[#FAF9F5] text-red-600">
          Failed to load news. Please try again later.
        </div>
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <SEO
          title="AI News | RecursivAI"
          description="Latest AI and technology news analyzed by artificial intelligence"
        />
        <div className="text-center py-10 bg-[#FAF9F5] text-black">
          No news posts available at the moment.
        </div>
      </>
    );
  }

  // Separate posts for different sections
  const mainFeature = posts[0];
  const secondaryFeatures = posts.slice(1, 3);
  const remainingPosts = posts.slice(3, NUM_POSTS_TO_FETCH);

  return (
    <>
      <SEO
        title="AI News | RecursivAI"
        description="Latest artificial intelligence and technology news, analyzed and summarized by AI. Stay updated with breaking developments in machine learning, AI research, and tech innovation."
        keywords="AI news, technology news, artificial intelligence, machine learning news, tech updates, AI breakthroughs"
      />
      
      <div className="w-full bg-[#FAF9F5]">
        <div className="newspaper-page min-h-screen w-full bg-[#FAF9F5] text-black transform scale-90 origin-top mx-auto">
          {/* Header/Navigation */}
          <header className="pt-4 pb-4 bg-[#FAF9F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="text-s tracking-wider font-medium">
                  {today.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="text-center flex-grow my-4">
                  <nav className="mb-1 font-body">
                    <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-black mx-3">News</Link>
                    <Link href="/" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Research</Link>
                    <Link href="/curated" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">Curated</Link>
                    <Link href="/about" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-black mx-3">About</Link>
                  </nav>
                  <h1 className="text-5xl font-serif font-black">
                    RecursivAI
                  </h1>
                  {/* Tagline */}
                  <p className="text-center text-base italic font-serif text-gray-700 mt-1 mb-4">
                    Who better to keep up with AI than AI itself?
                  </p>
              </div>
              <div className="text-s tracking-wider invisible">
                  {/* Empty div for flex spacing */}
                  {today.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t-4 border-double border-black bg-[#FAF9F5]">
            {/* Featured Stories Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
              {/* Main Feature */}
              {mainFeature && (
                <div className="md:col-span-7 border-r border-gray-300 pr-6">
                  <Link href={`/post/${mainFeature.slug}`}>
                    <div className="aspect-[16/9] mb-4 overflow-hidden relative">
                      {mainFeature.featured_image_url ? (
                        <Image
                          src={mainFeature.featured_image_url}
                          alt={mainFeature.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src={getPlaceholderImage(0)}
                          alt="Featured image placeholder"
                          fill
                          className="object-cover grayscale"
                        />
                      )}
                    </div>
                    <h2 className="text-3xl font-serif font-bold mb-3 leading-tight">
                      {mainFeature.title}
                    </h2>
                    <p className="text-base mb-2 news-content dropcap">{mainFeature.summary}</p>
                    <p className="text-xs text-gray-500 italic">
                      {formatDate(mainFeature.created_at)}
                    </p>
                  </Link>
                </div>
              )}

              {/* Secondary Features */}
              <div className="md:col-span-5">
                {secondaryFeatures.map((post, index) => (
                  <Link key={post.slug} href={`/post/${post.slug}`}>
                    <div
                      className={`flex items-start gap-4 ${
                        index !== 0 ? "border-t pt-4 mt-4 border-gray-300" : ""
                      }`}
                    >
                      <div className="w-1/2 flex-shrink-0">
                        <div className="aspect-[16/11] overflow-hidden relative">
                          {post.featured_image_url ? (
                            <Image
                              src={post.featured_image_url}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <Image
                              src={getPlaceholderImage(index + 1)}
                              alt="Image placeholder"
                              fill
                              className="object-cover grayscale"
                            />
                          )}
                        </div>
                      </div>
                      <div className="w-1/2">
                        <h3 className="text-xl font-serif font-bold mb-2 leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-sm mb-2 news-content">{post.summary}</p>
                        <p className="text-xs text-gray-500 italic">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Section Divider */}
            <div className="border-t border-gray-300 mb-6 pt-1">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Latest News</h4>
            </div>

            {/* Remaining Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              {remainingPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}`}
                  className={`pb-4 md:px-3 ${index % 3 !== 0 ? 'md:border-l md:border-gray-300' : ''}`}
                >
                  <div className="aspect-[16/9] mb-3 overflow-hidden relative">
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={getPlaceholderImage(index + 3)}
                        alt="Image placeholder"
                        fill
                        className="object-cover grayscale"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-bold mb-2 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm mb-2 news-content">{post.summary}</p>
                  <p className="text-xs text-gray-500 italic">
                    {formatDate(post.created_at)}
                  </p>
                </Link>
              ))}
            </div>

          </main>

          {/* Simple Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-300 text-sm text-gray-500 bg-[#FAF9F5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
              © {new Date().getFullYear()} RecursivAI Times. All Rights Reserved.
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const posts = await getNewsPosts({ limit: NUM_POSTS_TO_FETCH });
    return { props: { initialPosts: posts } };
  } catch (error) {
    console.error('Failed to fetch initial news posts:', error);
    return { props: { initialPosts: [], error: 'Failed to load news posts' } };
  }
}