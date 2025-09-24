import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NewsEmail from "../../emails/NewsEmail";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default async function handler(req, res) {
  try {
    const url = new URL("/posts/news?limit=12", API_BASE_URL);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const posts = await response.json();
    const html = renderToStaticMarkup(<NewsEmail posts={posts} generatedAt={new Date().toISOString()} />);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (error) {
    console.error("newsletter-html error", error);
    res.status(500).json({ error: "Failed to render newsletter" });
  }
}


