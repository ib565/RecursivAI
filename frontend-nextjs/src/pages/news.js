import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getNewsPosts } from "../utils/apiService";

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

/* Reusable card primitives (fill their grid cell neatly) */
function Card({ post, children, className = "" }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className={`group block h-full overflow-hidden rounded border border-stone-300 bg-white ${className}`}
    >
      {children}
    </Link>
  );
}

function CardMedia({ src, alt }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}

function CardText({ title, summary, tight = false }) {
  return (
    <div className={`p-3 ${tight ? "pt-2" : ""}`}>
      <h4 className="font-serif text-lg font-bold leading-snug line-clamp-2">
        {title}
      </h4>
      {summary ? (
        <p className="mt-1 text-sm text-stone-800 line-clamp-3">{summary}</p>
      ) : null}
    </div>
  );
}

/* Editorial modules (flush, patterned layouts) */
function ModuleA({ posts }) {
  // Pattern: Large left (span 7x2), two stacked medium on right (5x1 each)
  const [p0, p1, p2] = posts;
  if (!p0) return null;

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-[220px] md:auto-rows-[240px] lg:auto-rows-[260px]">
      {/* Large */}
      <Card post={p0} className="col-span-12 row-span-2 md:col-span-7">
        <div className="grid h-full grid-rows-[1fr_auto]">
          <CardMedia
            src={p0.featured_image_url || getPlaceholderImage(0)}
            alt={p0.title}
          />
          <CardText title={p0.title} summary={p0.summary} />
        </div>
      </Card>

      {/* Medium 1 */}
      {p1 && (
        <Card post={p1} className="col-span-12 md:col-span-5">
          <div className="grid h-full grid-rows-[1fr_auto]">
            <CardMedia
              src={p1.featured_image_url || getPlaceholderImage(1)}
              alt={p1.title}
            />
            <CardText
              title={p1.title}
              summary={p1.summary}
              
              tight
            />
          </div>
        </Card>
      )}

      {/* Medium 2 */}
      {p2 && (
        <Card post={p2} className="col-span-12 md:col-span-5">
          <div className="grid h-full grid-rows-[1fr_auto]">
            <CardMedia
              src={p2.featured_image_url || getPlaceholderImage(2)}
              alt={p2.title}
            />
            <CardText
              title={p2.title}
              summary={p2.summary}
              
              tight
            />
          </div>
        </Card>
      )}
    </div>
  );
}

function ModuleB({ posts }) {
  // Mirror of A: two stacked medium on left, large on right
  const [p0, p1, p2] = posts;
  if (!p0) return null;

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-[220px] md:auto-rows-[240px] lg:auto-rows-[260px]">
      {/* Medium 1 */}
      <Card post={p0} className="col-span-12 md:col-span-5">
        <div className="grid h-full grid-rows-[1fr_auto]">
          <CardMedia
            src={p0.featured_image_url || getPlaceholderImage(0)}
            alt={p0.title}
          />
          <CardText
            title={p0.title}
            summary={p0.summary}
            tight
          />
        </div>
      </Card>

      {/* Medium 2 */}
      {p1 && (
        <Card post={p1} className="col-span-12 md:col-span-5">
          <div className="grid h-full grid-rows-[1fr_auto]">
            <CardMedia
              src={p1.featured_image_url || getPlaceholderImage(1)}
              alt={p1.title}
            />
            <CardText
              title={p1.title}
              summary={p1.summary}
              tight
            />
          </div>
        </Card>
      )}

      {/* Large */}
      {p2 && (
        <Card post={p2} className="col-span-12 row-span-2 md:col-span-7 md:col-start-6">
          <div className="grid h-full grid-rows-[1fr_auto]">
            <CardMedia
              src={p2.featured_image_url || getPlaceholderImage(2)}
              alt={p2.title}
            />
            <CardText title={p2.title} summary={p2.summary} />
          </div>
        </Card>
      )}
    </div>
  );
}

function TwoUp({ posts }) {
  // Fallback for leftover 2 posts: two equal wides
  const [p0, p1] = posts;
  if (!p0) return null;

  return (
    <div className="grid grid-cols-12 gap-6 auto-rows-[220px] md:auto-rows-[240px] lg:auto-rows-[260px]">
      <Card post={p0} className="col-span-12 md:col-span-6">
        <div className="grid h-full grid-rows-[1fr_auto]">
          <CardMedia
            src={p0.featured_image_url || getPlaceholderImage(0)}
            alt={p0.title}
          />
          <CardText title={p0.title} summary={p0.summary} />
        </div>
      </Card>
      {p1 && (
        <Card post={p1} className="col-span-12 md:col-span-6">
          <div className="grid h-full grid-rows-[1fr_auto]">
            <CardMedia
              src={p1.featured_image_url || getPlaceholderImage(1)}
              alt={p1.title}
            />
            <CardText title={p1.title} summary={p1.summary}  />
          </div>
        </Card>
      )}
    </div>
  );
}

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
        <div className="text-center py-10 bg-stone-50 text-red-600">
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
        <div className="text-center py-10 bg-stone-50 text-black">
          No news posts available at the moment.
        </div>
      </>
    );
  }

  // Top allocations (unchanged)
  const hero = posts[0];

  // Right-rail briefs (leave as-is to keep your “top looks great”)
  const briefs = posts.slice(3, 9);

  // Editorial content below the fold:
  // Use 1–2 as featureable, skip 3–8 (used in briefs), then continue with the rest
  const editorialPosts = [
    ...posts.slice(1, 3), // 1,2
    ...posts.slice(9, NUM_POSTS_TO_FETCH), // remaining after briefs
  ].filter(Boolean);

  // Build modules of 3 posts: A, B, A, B...
  const modules = [];
  for (let i = 0; i < editorialPosts.length; i += 3) {
    modules.push(editorialPosts.slice(i, i + 3));
  }

  return (
    <>
      <SEO
        title="AI News | RecursivAI"
        description="Latest artificial intelligence and technology news, analyzed and summarized by AI."
        keywords="AI news, technology news, artificial intelligence, machine learning news, tech updates, AI breakthroughs"
      />

      <div className="w-full bg-stone-50 text-stone-900">
        {/* Masthead */}
        <header className="border-b border-stone-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-xs tracking-wider">
                {today.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="text-center">
                <nav className="mb-2">
                  <Link
                    href="/news"
                    className="mx-3 text-xs font-bold uppercase tracking-wider"
                  >
                    News
                  </Link>
                  <Link
                    href="/"
                    className="mx-3 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900"
                  >
                    Research
                  </Link>
                  <Link
                    href="/curated"
                    className="mx-3 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900"
                  >
                    Curated
                  </Link>
                  <Link
                    href="/about"
                    className="mx-3 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900"
                  >
                    About
                  </Link>
                </nav>
                <h1 className="font-serif text-5xl font-extrabold tracking-tight">
                  RecursivAI
                </h1>
                <p className="mt-1 text-sm italic text-stone-600">
                  Who better to keep up with AI than AI itself?
                </p>
              </div>
              <div className="flex items-center">
                <Image
                  src="/images/Rex.png"
                  alt="Rex - RecursivAI Mascot"
                  width={100}
                  height={100}
                  className="rounded-full border-2 border-stone-300 hover:border-stone-400 transition-colors duration-200"
                />
              </div>
            </div>
          </div>


        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Top: hero + right rail (unchanged) */}
          <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Hero */}
            {hero && (
              <Link href={`/post/${hero.slug}`} className="group md:col-span-7">
                <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded">
                  <Image
                    src={hero.featured_image_url || getPlaceholderImage(0)}
                    alt={hero.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                  Top Story
                </div>
                <h2 className="mb-2 font-serif text-4xl font-extrabold leading-tight">
                  {hero.title}
                </h2>
                <p className="mb-3 text-base text-stone-800">{hero.summary}</p>
              </Link>
            )}

            {/* Right rail */}
            <aside className="md:col-span-5">
              <div className="md:sticky md:top-6 flex flex-col gap-4">
                <Link
                  href="/ai-101"
                  className="block rounded border border-stone-300 bg-white p-4 hover:border-stone-400"
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                    AI 101
                  </div>
                  <h3 className="font-serif text-xl font-bold leading-snug">
                    Retrieval Augmented Generation, in plain English
                  </h3>
                  <p className="mt-2 text-sm text-stone-700">
                    Why chatbots “look up” facts, and when to use RAG vs. fine
                    tuning.
                  </p>
                </Link>

                <Link
                  href="/rexommendation"
                  className="block rounded border border-stone-300 bg-white p-4 hover:border-stone-400"
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                    Rexommendation
                  </div>
                  <h3 className="font-serif text-xl font-bold leading-snug">
                    Aider — a disciplined CLI pair-programmer
                  </h3>
                  <p className="mt-2 text-sm text-stone-700">
                    Works directly with your repo for patch-based edits.
                  </p>
                </Link>

                <div className="rounded border border-stone-300 bg-white p-4">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                    Latest news
                  </div>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {briefs.map((post) => (
                      <li key={post.slug}>
                        <Link
                          href={`/post/${post.slug}`}
                          className="group block"
                          title={post.title}
                        >
                          <div className="font-semibold leading-snug">
                            {post.title}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </section>

          {/* Editorial blocks (replace old Secondary + Mosaic) */}
          {editorialPosts.length > 0 && (
            <section className="mt-12 space-y-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">
                More stories
              </div>

              {modules.map((group, idx) =>
                group.length === 2 ? (
                  <TwoUp key={idx} posts={group} />
                ) : idx % 2 === 0 ? (
                  <ModuleA key={idx} posts={group} />
                ) : (
                  <ModuleB key={idx} posts={group} />
                )
              )}
            </section>
          )}
        </main>

        <footer className="mt-12 border-top border-stone-300 py-8 text-center text-sm text-stone-500">
          © {new Date().getFullYear()} RecursivAI. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const posts = await getNewsPosts({ limit: NUM_POSTS_TO_FETCH });
    return {
      props: { initialPosts: posts },
      revalidate: 300,
    };
  } catch (error) {
    console.error("Failed to fetch initial news posts:", error);
    return {
      props: { initialPosts: [], error: "Failed to load news posts" },
    };
  }
}