import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Img, Button, Hr, Link } from "@react-email/components";

const placeholderImages = [
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-1.jpeg",
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-2.jpg",
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-3.png",
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-4.jpg",
];

const getPlaceholderImage = (index) => placeholderImages[index % placeholderImages.length];

export default function NewsEmail({ posts = [], ai101 = null, generatedAt = new Date().toISOString() }) {
  const mainPosts = posts.slice(0, 2);
  const spotlightPost = posts[4] || null;
  const sidebarPosts = posts
    .filter((post) => !spotlightPost || post.slug !== spotlightPost.slug)
    .filter((post) => !mainPosts.find((main) => main.slug === post.slug))
    .slice(0, 10);

  return (
    <Html>
      <Head />
      <Preview>Rex&apos;s Daily AI Intelligence Report</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} width="620">
          <Section style={styles.header}>
            <div style={styles.headerTop}>
              <Text style={styles.logo}>🦕 RecursivAI</Text>
              <Text style={styles.date}>{new Date(generatedAt).toDateString()}</Text>
            </div>
            <Hr style={styles.hr} />
            <Heading as="h1" style={styles.h1}>AI News</Heading>
            <Text style={styles.subtle}>Latest artificial intelligence and technology news, analyzed by AI.</Text>
          </Section>

          <Section style={styles.latestSection}>
            <Heading as="h3" style={styles.h3}>Latest News</Heading>
            <div>
              {sidebarPosts.slice(0, 2).map((post, index) => (
                <Link key={post.slug} href={`https://recursivai.vercel.app/post/${post.slug}`} style={styles.featuredLatest}>
                  <Img
                    src={post.featured_image_url || getPlaceholderImage(index)}
                    alt={post.title}
                    width="560"
                    height="320"
                    style={styles.featuredImage}
                  />
                  <Text style={styles.latestTitle}>{post.title}</Text>
                </Link>
              ))}
            </div>
            <div style={styles.latestList}>
              {sidebarPosts.slice(2).map((post) => (
                <Link key={post.slug} href={`https://recursivai.vercel.app/post/${post.slug}`} style={styles.listItem}>
                  <Text style={styles.listTitle}>• {post.title}</Text>
                </Link>
              ))}
            </div>
          </Section>

          <Section style={styles.mainStories}>
            {mainPosts.map((post, index) => (
              <Section key={post.slug} style={styles.mainCard}>
                <Heading as="h2" style={styles.h2}>{post.title}</Heading>
                <Img
                  src={post.featured_image_url || getPlaceholderImage(index)}
                  alt={post.title}
                  width="560"
                  height="320"
                  style={styles.hero}
                />
                <Text style={styles.summary}>{post.summary}</Text>
                <Button
                  style={styles.cta}
                  href={`https://recursivai.vercel.app/post/${post.slug}`}
                >Read More →</Button>
                {post.ai_metadata?.rex_take ? (
                  <Text style={styles.rexTake}>🦕 Rex&apos;s take: {post.ai_metadata.rex_take}</Text>
                ) : (
                  <Text style={styles.rexTake}>🦕 Rex&apos;s take: Staying sharp on the latest AI move.</Text>
                )}
              </Section>
            ))}
          </Section>

          {spotlightPost && (
            <Section style={styles.card}>
              <Heading as="h3" style={styles.h3}>Spotlight</Heading>
              <Img
                src={spotlightPost.featured_image_url || getPlaceholderImage(4)}
                alt={spotlightPost.title}
                width="560"
                height="315"
                style={styles.featuredImage}
              />
              <Text style={styles.small}><b>{spotlightPost.title}</b></Text>
              {spotlightPost.summary && (
                <Text style={styles.small}>{spotlightPost.summary}</Text>
              )}
              {spotlightPost.ai_metadata?.rex_take && (
                <Text style={styles.muted}><i>🦕 Rex says: {spotlightPost.ai_metadata.rex_take}</i></Text>
              )}
              <Button
                style={styles.ctaSecondary}
                href={`https://recursivai.vercel.app/post/${spotlightPost.slug}`}
              >Read Spotlight →</Button>
            </Section>
          )}

          <Section style={styles.card}>
            <Heading as="h3" style={styles.h3}>{ai101?.title || "AI 101"}</Heading>
            {ai101?.featured_image_url && (
              <Img
                src={ai101.featured_image_url}
                alt={ai101.title}
                width="560"
                height="315"
                style={styles.featuredImage}
              />
            )}
            {ai101?.summary ? (
              <Text style={styles.small}><b>{ai101.summary}</b></Text>
            ) : (
              <Text style={styles.small}><b>Catch the latest AI 101 explainer.</b></Text>
            )}
            {ai101 ? (
              <Button
                style={styles.ctaSecondary}
                href={`https://recursivai.vercel.app/post/${ai101.slug}`}
              >Read AI 101 →</Button>
            ) : null}
          </Section>

          <Section style={styles.card}>
            <Heading as="h3" style={styles.h3}>Rexommendation</Heading>
            <Text style={styles.small}><b>Try Windsurf!</b> The new AI coding tool that caught Rex&apos;s attention.</Text>
            <Text style={styles.muted}>More recommendations coming soon.</Text>
          </Section>

          <Section style={styles.footerCard}>
            <Heading as="h3" style={styles.h3Center}>Free Lifetime Subscription</Heading>
            <Text style={styles.center}>Join Rex&apos;s Daily AI Intelligence Report</Text>
            <Button
              href="https://recursivai.vercel.app/#subscribe"
              style={styles.ctaDark}
            >Claim Your Spot</Button>
            <Text style={styles.mutedCenter}>✅ 100% Free · ✅ Daily 7AM · ✅ Unsubscribe Anytime</Text>
            <Text style={styles.mutedCenter}><i>&quot;Don&apos;t let AI evolution leave you behind!&quot; - Rex 🦕</i></Text>
          </Section>

          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.mutedCenter}>You received this because you subscribed at recursivai</Text>
            <Text style={styles.mutedCenter}><Link href="https://recursivai.vercel.app/" style={styles.link}>Home</Link> · <Link href="https://recursivai.vercel.app/news" style={styles.link}>News</Link> · <Link href="https://recursivai.vercel.app/unsubscribe" style={styles.link}>Unsubscribe</Link></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#FAF9F5", color: "#111", fontFamily: 'Georgia, "Times New Roman", serif' },
  container: { width: "100%", maxWidth: 620, margin: "0 auto", backgroundColor: "#fff", padding: 16 },
  header: { paddingBottom: 8 },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 },
  logo: { fontSize: 18, fontWeight: 700 },
  date: { fontSize: 12, color: "#666" },
  hr: { borderColor: "#ddd" },
  h1: { fontSize: 28, margin: "12px 0" },
  h2: { fontSize: 22, margin: "8px 0" },
  h3: { fontSize: 16, marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 6 },
  h3Center: { fontSize: 18, textAlign: "center", marginBottom: 8 },
  h4: { fontSize: 14, marginBottom: 8 },
  subtle: { fontSize: 12, color: "#666" },
  latestSection: { marginBottom: 24 },
  featuredLatest: { display: "block", textDecoration: "none", color: "inherit", marginBottom: 16 },
  latestTitle: { fontSize: 14, lineHeight: "20px", fontWeight: 600 },
  featuredImage: { width: "100%", height: "auto", borderRadius: 6, display: "block", marginBottom: 8 },
  latestList: { marginTop: 8 },
  listItem: { display: "block", textDecoration: "none", color: "inherit", marginBottom: 6 },
  listTitle: { fontSize: 12, lineHeight: "18px" },
  thumb: { borderRadius: 4, objectFit: "cover" },
  mainStories: { marginBottom: 24 },
  mainCard: { marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #eee" },
  hero: { width: "100%", height: "auto", borderRadius: 6 },
  summary: { fontSize: 14, lineHeight: "20px" },
  rexTake: { fontSize: 12, color: "#1e3a8a", marginTop: 8 },
  card: { backgroundColor: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, marginBottom: 16 },
  small: { fontSize: 12, lineHeight: "18px" },
  muted: { fontSize: 12, color: "#666" },
  center: { textAlign: "center" },
  mutedCenter: { textAlign: "center", fontSize: 12, color: "#666", marginTop: 8 },
  footerCard: { border: "2px double #000", padding: 16, textAlign: "center", marginTop: 16 },
  cta: { backgroundColor: "#facc15", color: "#111", padding: "10px 14px", borderRadius: 6, textDecoration: "none", display: "inline-block", fontWeight: 700 },
  ctaSecondary: { backgroundColor: "#fff", color: "#111", padding: "8px 12px", borderRadius: 6, textDecoration: "none", display: "inline-block", fontWeight: 600, border: "1px solid #ddd", marginTop: 8 },
  ctaDark: { backgroundColor: "#000", color: "#fff", padding: "12px 18px", borderRadius: 6, textDecoration: "none", display: "inline-block", fontWeight: 700 },
  footer: { marginTop: 16 },
  link: { color: "#2563eb", textDecoration: "underline" },
  aiImage: { width: "100%", height: "auto", borderRadius: 6, marginBottom: 8 },
};


