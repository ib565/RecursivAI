import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NewsEmail from "../../emails/NewsEmail";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default async function handler(req, res) {
  try {
    const newsUrl = new URL("/posts/news?limit=12", API_BASE_URL);
    const ai101Url = new URL("/posts/ai101?limit=1", API_BASE_URL);

    const fetchOptions = { cache: "no-store" };

    const [newsRes, ai101Res] = await Promise.all([
      fetch(newsUrl.toString(), fetchOptions),
      fetch(ai101Url.toString(), fetchOptions),
    ]);

    if (!newsRes.ok) {
      throw new Error(`News API error: ${newsRes.status}`);
    }

    const posts = await newsRes.json();

    let ai101Post = null;
    if (ai101Res.ok) {
      const ai101Posts = await ai101Res.json();
      ai101Post = Array.isArray(ai101Posts) ? ai101Posts[0] ?? null : null;
    }

    const html = renderToStaticMarkup(
      <NewsEmail
        posts={posts}
        ai101={ai101Post}
        generatedAt={new Date().toISOString()}
      />
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (error) {
    console.error("newsletter-html error", error);
    res.status(500).json({ error: "Failed to render newsletter" });
  }
}


