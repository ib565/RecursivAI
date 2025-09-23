import React, { useState, useEffect, useRef } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Dynamic import for mermaid to avoid SSR issues
const loadMermaid = async () => {
  if (typeof window !== 'undefined') {
    const mermaid = await import('mermaid');
    return mermaid.default;
  }
  return null;
};

function MarkdownRenderer({ children }) {
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);

  useEffect(() => {
    const processMarkdown = async () => {
      if (!children) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Create processor pipeline without rehype-mermaid for SSR compatibility
        const processor = unified()
          .use(remarkParse) // Parse markdown to mdast
          .use(remarkGfm) // Support GitHub Flavored Markdown
          .use(remarkRehype, { allowDangerousHtml: true }) // Convert mdast to hast
          .use(rehypeRaw) // Parse HTML in markdown
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

  // Handle Mermaid diagrams client-side
  useEffect(() => {
    const initMermaid = async () => {
      if (!containerRef.current || !html) return;

      try {
        const mermaid = await loadMermaid();
        if (!mermaid) return;

        if (!mermaidLoaded) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'loose',
            fontFamily: 'monospace',
            themeVariables: {
              primaryColor: '#7c3aed',
              primaryTextColor: '#ffffff',
              primaryBorderColor: '#a855f7',
              lineColor: '#00ffff',
              secondaryColor: '#1e1b4b',
              tertiaryColor: '#312e81',
              background: '#0f0f12',
              mainBkg: '#1e1b4b',
              secondBkg: '#312e81',
              tertiaryBkg: '#4c1d95',
              // Fix light blue boxes specifically
              nodeBkg: '#1e40af',
              nodeTextColor: '#ffffff',
              clusterBkg: '#1e3a8a',
              edgeLabelBackground: '#1e40af',
              c0: '#7c3aed',
              c1: '#1e40af',
              c2: '#059669',
              c3: '#dc2626',
              c4: '#ea580c'
            }
          });
          setMermaidLoaded(true);
        }

        // Find all code blocks with mermaid class
        const mermaidBlocks = containerRef.current.querySelectorAll('code.language-mermaid, pre code.language-mermaid');
        
        mermaidBlocks.forEach(async (block, index) => {
          const content = block.textContent;
          const id = `mermaid-${Date.now()}-${index}`;
          
          try {
            const { svg } = await mermaid.render(id, content);
            
                         // Create a div to hold the SVG
             const wrapper = document.createElement('div');
             wrapper.className = 'mermaid-diagram';
             wrapper.setAttribute('data-type', 'mermaid');
             wrapper.innerHTML = svg;
             
             // Scale down the SVG
             const svgElement = wrapper.querySelector('svg');
             if (svgElement) {
               svgElement.style.transform = 'scale(0.8)';
               svgElement.style.transformOrigin = 'center center';
               svgElement.style.maxWidth = '100%';
               svgElement.style.height = 'auto';
             }
            
            // Replace the code block with the rendered diagram
            if (block.parentElement.tagName === 'PRE') {
              block.parentElement.replaceWith(wrapper);
            } else {
              block.replaceWith(wrapper);
            }
          } catch (err) {
            console.error('Error rendering Mermaid diagram:', err);
            // Keep the original code block if rendering fails
          }
        });
      } catch (err) {
        console.error('Error loading Mermaid:', err);
      }
    };

    if (html && typeof window !== 'undefined') {
      // Small delay to ensure DOM is ready
      setTimeout(initMermaid, 100);
    }
  }, [html, mermaidLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span>Loading content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded p-4 text-red-400">
        <strong>Error rendering content:</strong> {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownRenderer;
