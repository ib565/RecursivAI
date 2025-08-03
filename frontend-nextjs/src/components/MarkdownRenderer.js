import React, { useState, useEffect } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeMermaid from "rehype-mermaid";
import remarkGfm from "remark-gfm";

function MarkdownRenderer({ children }) {
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processMarkdown = async () => {
      if (!children) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Create processor pipeline
        const processor = unified()
          .use(remarkParse) // Parse markdown to mdast
          .use(remarkGfm) // Support GitHub Flavored Markdown
          .use(remarkRehype) // Convert mdast to hast
          .use(rehypeMermaid) // Process mermaid codeblocks
          .use(rehypeStringify); // Convert hast to HTML string

        // Process the markdown
        const result = await processor.process(children);

        // Set the HTML
        setHtml(result.toString());
        setError(null);
      } catch (err) {
        console.error("Error processing markdown:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    processMarkdown();
  }, [children]);

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  if (error) {
    return <div>Error rendering content: {error}</div>;
  }

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownRenderer;
