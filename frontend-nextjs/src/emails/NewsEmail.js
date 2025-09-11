import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Heading, Img, Button, Hr, Row, Column, Link } from "@react-email/components";

const placeholderImages = [
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-1.jpeg",
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-2.jpg",
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-3.png",
  "https://recursivai-assets.s3.amazonaws.com/images/placeholder-4.jpg",
];

const getPlaceholderImage = (index) => placeholderImages[index % placeholderImages.length];

export default function NewsEmail({ posts = [], generatedAt = new Date().toISOString() }) {
  const mainPosts = posts.slice(0, 2);
  const sidebarPosts = posts.slice(2, 12);

  return (
    <Html>
      <Head />
      <Preview>Rex&apos;s Daily AI Intelligence Report</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Row>
              <Column>
                <Text style={styles.logo}>🦕 RecursivAI</Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={styles.date}>{new Date(generatedAt).toDateString()}</Text>
              </Column>
            </Row>
            <Hr style={styles.hr} />
            <Heading as="h1" style={styles.h1}>AI News</Heading>
            <Text style={styles.subtle}>Latest artificial intelligence and technology news, analyzed by AI.</Text>
          </Section>

          <Section>
            <Row>
              <Column style={styles.leftCol}>
                <Heading as="h3" style={styles.h3}>Latest News</Heading>
                {sidebarPosts.slice(0, 2).map((post, index) => (
                  <Link key={post.slug} href={`https://recursiv.ai/post/${post.slug}`} style={styles.latestItem}>
                    <Row>
                      <Column style={{ width: 96 }}>
                        <Img
                          src={post.featured_image_url || getPlaceholderImage(index)}
                          alt={post.title}
                          width="96"
                          height="64"
                          style={styles.thumb}
                        />
                      </Column>
                      <Column>
                        <Text style={styles.latestTitle}>{post.title}</Text>
                      </Column>
                    </Row>
                  </Link>
                ))}
                {sidebarPosts.slice(2).map((post, index) => (
                  <Link key={post.slug} href={`https://recursiv.ai/post/${post.slug}`} style={styles.listItem}>
                    <Text style={styles.listTitle}>{index + 1}. {post.title}</Text>
                  </Link>
                ))}
              </Column>

              <Column style={styles.centerCol}>
                {mainPosts.map((post, index) => (
                  <Section key={post.slug} style={styles.mainCard}>
                    <Heading as="h2" style={styles.h2}>{post.title}</Heading>
                    <Img
                      src={post.featured_image_url || getPlaceholderImage(index)}
                      alt={post.title}
                      width="600"
                      height="338"
                      style={styles.hero}
                    />
                    <Text style={styles.summary}>{post.summary}</Text>
                    <Button
                      style={styles.cta}
                      href={`https://recursiv.ai/post/${post.slug}`}
                    >Read More →</Button>
                    <Text style={styles.rexTake}>🦕 Rex&apos;s take: This is a significant development.</Text>
                  </Section>
                ))}
              </Column>

              <Column style={styles.rightCol}>
                <Section style={styles.card}>
                  <Heading as="h3" style={styles.h3}>AI 101: RAG</Heading>
                  <Text style={styles.small}><b>RAG = AI + Library Pass + Brain.</b></Text>
                  <Text style={styles.small}>It retrieves real info (the &quot;R&quot;) and then generates a smart answer (the &quot;G&quot;).</Text>
                </Section>

                <Section style={styles.card}>
                  <Heading as="h3" style={styles.h3}>Rexommendation</Heading>
                  <Text style={styles.small}><b>Try Windsurf!</b> The new AI coding tool that caught Google's attention.</Text>
                </Section>

                <Section style={styles.card}>
                  <Heading as="h3" style={styles.h4}>Corporate Cringe of the Week</Heading>
                  <Text style={styles.small}>
                    &quot;Our revolutionary AI breakthrough will disrupt every industry and create unlimited synergistic value
                    propositions while leveraging blockchain-enabled quantum machine learning...&quot;
                  </Text>
                  <Text style={styles.muted}><i>🦕 Rex says: Just tell me what it actually does!</i></Text>
                </Section>
              </Column>
            </Row>
          </Section>

          <Section style={styles.footerCard}>
            <Heading as="h3" style={styles.h3Center}>Free Lifetime Subscription</Heading>
            <Text style={styles.center}>Join Rex&apos;s Daily AI Intelligence Report</Text>
            <Button
              href="https://recursiv.ai/#subscribe"
              style={styles.ctaDark}
            >Claim Your Spot</Button>
            <Text style={styles.mutedCenter}>✅ 100% Free · ✅ Daily 7AM · ✅ Unsubscribe Anytime</Text>
            <Text style={styles.mutedCenter}><i>&quot;Don&apos;t let AI evolution leave you behind!&quot; - Rex 🦕</i></Text>
          </Section>

          <Section style={styles.footer}>
            <Hr style={styles.hr} />
            <Text style={styles.mutedCenter}>You received this because you subscribed at recursiv.ai</Text>
            <Text style={styles.mutedCenter}><Link href="https://recursiv.ai" style={styles.link}>Home</Link> · <Link href="https://recursiv.ai/news" style={styles.link}>News</Link> · <Link href="https://recursiv.ai/unsubscribe" style={styles.link}>Unsubscribe</Link></Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: { backgroundColor: "#FAF9F5", color: "#111", fontFamily: 'Georgia, "Times New Roman", serif' },
  container: { width: "100%", maxWidth: 800, margin: "0 auto", backgroundColor: "#fff", padding: 16 },
  header: { paddingBottom: 8 },
  logo: { fontSize: 18, fontWeight: 700 },
  date: { fontSize: 12, color: "#666" },
  hr: { borderColor: "#ddd" },
  h1: { fontSize: 28, margin: "12px 0" },
  h2: { fontSize: 22, margin: "8px 0" },
  h3: { fontSize: 16, marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 6 },
  h3Center: { fontSize: 18, textAlign: "center", marginBottom: 8 },
  h4: { fontSize: 14, marginBottom: 8 },
  subtle: { fontSize: 12, color: "#666" },
  leftCol: { paddingRight: 12, borderRight: "1px solid #eee", width: "25%" },
  centerCol: { padding: "0 12px", borderRight: "1px solid #eee", width: "50%" },
  rightCol: { paddingLeft: 12, width: "25%" },
  latestItem: { display: "block", textDecoration: "none", color: "inherit", marginBottom: 8 },
  latestTitle: { fontSize: 12, lineHeight: "16px" },
  listItem: { display: "block", textDecoration: "none", color: "inherit", marginBottom: 6 },
  listTitle: { fontSize: 12 },
  thumb: { borderRadius: 4, objectFit: "cover" },
  mainCard: { marginBottom: 16 },
  hero: { width: "100%", height: "auto", borderRadius: 6 },
  summary: { fontSize: 14, lineHeight: "20px" },
  rexTake: { fontSize: 12, color: "#1e3a8a", marginTop: 8 },
  card: { backgroundColor: "#fff", border: "1px solid #eee", padding: 12, borderRadius: 6, marginBottom: 12 },
  small: { fontSize: 12, lineHeight: "18px" },
  muted: { fontSize: 12, color: "#666" },
  center: { textAlign: "center" },
  mutedCenter: { textAlign: "center", fontSize: 12, color: "#666", marginTop: 8 },
  footerCard: { border: "2px double #000", padding: 16, textAlign: "center", marginTop: 16 },
  cta: { backgroundColor: "#facc15", color: "#111", padding: "10px 14px", borderRadius: 6, textDecoration: "none", display: "inline-block", fontWeight: 700 },
  ctaDark: { backgroundColor: "#000", color: "#fff", padding: "12px 18px", borderRadius: 6, textDecoration: "none", display: "inline-block", fontWeight: 700 },
  footer: { marginTop: 16 },
  link: { color: "#2563eb", textDecoration: "underline" }
};


