// Global CSS for blog content

const BlogContentStyles = `
  .blog-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.375rem;
    margin: 1rem 0;
  }

  .blog-content h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem;
  }

  .blog-content h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem;
  }

  .blog-content h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem;
  }

  .blog-content p {
    margin: 1rem 0;
    line-height: 1.6;
  }

  .blog-content ul,
  .blog-content ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  .blog-content li {
    margin: 0.5rem 0;
  }

  .blog-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    font-style: italic;
    margin: 1.5rem 0;
    color: #4b5563;
  }

  .blog-content pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }

  .blog-content code {
    font-family: monospace;
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
  }

  .blog-content a {
    color: #3b82f6;
    text-decoration: underline;
  }

  .blog-content .video-embed {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 ratio */
    height: 0;
    overflow: hidden;
    max-width: 100%;
    margin: 1.5rem 0;
  }

  .blog-content .video-embed iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export default BlogContentStyles;
