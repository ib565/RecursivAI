// components/SEO.js
import React from 'react';
import Head from 'next/head';

const SEO = ({ 
  title, 
  description, 
  ogTitle, 
  ogDescription, 
  ogImage, 
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  keywords
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Keywords */}
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* OpenGraph tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:type" content="article" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
    </Head>
  );
};

export default SEO;