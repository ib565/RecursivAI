# React to Next.js Migration Plan

This document outlines a detailed, step-by-step plan to migrate the AI blog frontend from Create React App (CRA) to Next.js. The goal is to leverage Next.js features like Server-Side Rendering (SSR) for improved performance and SEO while preserving all existing features including the cyberpunk theme, dual layout system, and advanced markdown processing.

## Phase 1: Project Setup & Basic Configuration

In this phase, we'll create a new Next.js project and set up the basic configuration, including styles and dependencies.

### Step 1.1: Create a New Next.js App in Monorepo

We'll create a new Next.js project alongside your existing frontend in the same monorepo. This keeps everything organized in your current structure.

**Action:**
1. Navigate to your project root (`AI-content-gen`):
   ```bash
   cd /c/Stuff/uni_stuff/Projects/AI-content-gen
   ```

2. Create a new Next.js project:
   ```bash
   npx create-next-app@latest frontend-nextjs --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```
   
   When prompted, select:
   - TypeScript: No (to match your current setup)
   - ESLint: Yes
   - Tailwind CSS: Yes
   - src/ directory: Yes
   - App Router: No (use Pages Router to match your current structure)
   - Import alias: Yes (@/*)

This will create a new folder `frontend-nextjs` alongside your existing `frontend-ai-blog`, `blog_backend`, etc.

**Your monorepo structure will now look like:**
```
AI-content-gen/
├── blog_backend/
├── frontend-ai-blog/          # Your current React app
├── frontend-nextjs/           # New Next.js app (migration target)
├── initial_plan/
├── test_scripts/
├── MIGRATION_PLAN.md
├── README.md
└── render.yaml
```

### Step 1.2: Install Existing Dependencies

Now, we need to install the libraries your current project uses, including all markdown processing and testing dependencies.

**Action:**
1.  Navigate into the new project directory:
    ```bash
    cd frontend-nextjs
    ```
2.  Install all dependencies from your current `package.json`:

    ```bash
    npm install react-markdown rehype-mermaid rehype-raw rehype-stringify remark-gfm remark-parse remark-rehype unified web-vitals @tailwindcss/typography @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event
    ```

    Note: `react-router-dom` is intentionally excluded as Next.js has built-in routing.

### Step 1.3: Configure Tailwind CSS

Next.js has built-in support for PostCSS and Tailwind CSS, but we need to configure it.

**Action:**
1.  Your `create-next-app` installation should have included `tailwindcss`, `postcss`, and `autoprefixer`. You can verify this in your `package.json`.
2.  Replace the contents of `tailwind.config.js` with your EXACT existing configuration:

    ```javascript
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            'cyber-black': '#0f0f12',
            'cyber-dark': '#1a1a22',
            'cyber-gray': '#2a2a35',
            'cyber-neon': '#00ffff',
            'cyber-pink': '#ff00ff',
            'cyber-purple': '#9d4edd',
          },
        },
        fontFamily: {
          'cyber': ['"Share Tech Mono"', 'monospace'],
          'body': ['"Chakra Petch"', 'sans-serif'],
        },
      },
      plugins: [
        require('@tailwindcss/typography'),
      ],
    };
    ```
3. **CRITICAL**: Copy your entire `index.css` file content to `styles/globals.css` (or `app/globals.css` if using App Router). This includes:
   - All Google Fonts imports
   - Cyberpunk theme styles and animations
   - Newspaper page styles
   - Scanline effects
   - Custom component classes (cyber-card, cyber-btn, neon effects)
   - Markdown content styling

### Step 1.4: Copy Static Assets & Utilities

Let's move your images, utility functions, and other static files.

**Action:**
1.  Copy the contents of `frontend-ai-blog/public/` into `frontend-nextjs/public/` (including logo.png, images folder, content folder, manifest.json, etc.).
2.  Create a `utils` folder inside the new project root: `frontend-nextjs/utils/`.
3.  Copy `frontend-ai-blog/src/utils/apiService.js` and `frontend-ai-blog/src/utils/formatters.js` into the new `utils` directory.
4.  **CRITICAL**: Update the API service for Next.js environment variables:
   - In `utils/apiService.js`, change line 2 from:
     ```javascript
     const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
     ```
     to:
     ```javascript
     const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
     ```
5.  Create a `.env.local` file in the `frontend-nextjs` directory:
    ```
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ```
6.  Copy your current `vercel.json` to the `frontend-nextjs` root to preserve API proxy configuration.
7.  **CRITICAL**: Copy the `postcss.config.js` file to maintain PostCSS configuration.
8.  **Important**: Copy `.gitignore` and update it for Next.js:
    ```
    # Add Next.js specific ignores
    /.next/
    /out/
    
    # Keep existing CRA ignores
    /node_modules
    /.pnp
    .pnp.js
    /coverage
    /build  # Can remove this after migration
    .DS_Store
    .env.local
    .env.development.local
    .env.test.local
    .env.production.local
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    ```

### **Checkpoint 1:**
Run `npm run dev` in your terminal. You should see the default Next.js homepage. This confirms your project setup is correct.

## Phase 2: Migrating Components & Layout

Now we'll move your React components and set up the main layout for your application.

### Step 2.1: Migrate Reusable Components

**Action:**
1.  Copy the entire `frontend-ai-blog/src/components` directory to `frontend-nextjs/components`.
2.  **Update components for Next.js routing**:
   
   **Header.js changes:**
   - Change `import { Link } from "react-router-dom";` to `import Link from 'next/link';`
   - Update Link components (Next.js 13+ doesn't need nested `<a>` tags):
     ```javascript
     // Old React Router
     <Link to="/" className="text-white hover:text-cyber-neon">Home</Link>
     
     // New Next.js
     <Link href="/" className="text-white hover:text-cyber-neon">Home</Link>
     ```
   
   **PostCard.js changes:**
   - Change `import { Link } from 'react-router-dom';` to `import Link from 'next/link';`
   - Update the post link:
     ```javascript
     // Old
     <Link to={`/post/${post.slug}`} className="block h-full">
     
     // New
     <Link href={`/post/${post.slug}`} className="block h-full">
     ```
   
   **Footer.js changes:**
   - Change `import { Link } from "react-router-dom";` to `import Link from 'next/link';`
   - Update internal navigation links:
     ```javascript
     // Old
     <Link to="/" className="hover:text-cyber-neon">Home</Link>
     <Link to="/curated" className="hover:text-amber-400">Curated</Link>
     <Link to="/about" className="hover:text-cyber-pink">About</Link>
     
     // New
     <Link href="/" className="hover:text-cyber-neon">Home</Link>
     <Link href="/curated" className="hover:text-amber-400">Curated</Link>
     <Link href="/about" className="hover:text-cyber-pink">About</Link>
     ```
   - Keep external links (LinkedIn) as `<a>` tags - they're already correct
   
   **SEO.js migration:**
   - This component needs special attention for Next.js
   - Replace with Next.js Head component:
     ```javascript
     import Head from 'next/head';
     
     const SEO = ({ title, description }) => {
       return (
         <Head>
           <title>{title}</title>
           <meta name="description" content={description} />
         </Head>
       );
     };
     ```
   
   **Other components**: MarkdownRenderer.js and PostGrid.js should work without changes.

### Step 2.2: Create a Global Layout

We will create a layout component that includes your `Header` and `Footer`.

**Action:**
1. Create a new file: `components/Layout.js`.
2. Add the following code, which replicates the PageLayout logic from your `App.js`:

    ```javascript
    import Header from './Header';
    import Footer from './Footer';
    import { useRouter } from 'next/router';

    export default function Layout({ children }) {
      const router = useRouter();
      const isNewsPage = router.pathname === '/news';

      return (
        <div className="flex flex-col min-h-screen">
          {!isNewsPage && <Header />}
          
          {/* Main content with padding for fixed header */}
          <main className="flex-grow">
            {children}
          </main>
          
          {!isNewsPage && <Footer />}
        </div>
      );
    }
    ```

**Note**: This preserves your conditional header/footer logic for the news page layout.

### Step 2.3: Set Up Custom App (`_app.js`)

The `_app.js` file is a special Next.js file that wraps all your pages. It's the perfect place to use your global `Layout`.

**Action:**
1.  Create a new file: `pages/_app.js`.
2.  Add this code to use the `Layout` component and import your global stylesheet:

    ```javascript
    import Layout from '../components/Layout';
    import '../styles/globals.css'; // or the name of your css file

    function MyApp({ Component, pageProps }) {
      return (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      );
    }

    export default MyApp;
    ```

### Step 2.4: Add Google Analytics Support

Your current app has Google Analytics (G-4LBZ46K2HC). Next.js handles this differently than CRA.

**Action:**
1. Install Next.js Google Analytics:
   ```bash
   npm install @next/third-parties
   ```

2. Create `pages/_document.js` for custom HTML document:
   ```javascript
   import { Html, Head, Main, NextScript } from 'next/document'
   import Script from 'next/script'
   
   export default function Document() {
     return (
       <Html lang="en">
         <Head>
           {/* Global Site Tag (gtag.js) - Google Analytics */}
           <Script
             src="https://www.googletagmanager.com/gtag/js?id=G-4LBZ46K2HC"
             strategy="afterInteractive"
           />
           <Script id="google-analytics" strategy="afterInteractive">
             {`
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', 'G-4LBZ46K2HC');
             `}
           </Script>
         </Head>
         <body>
           <Main />
           <NextScript />
         </body>
       </Html>
     )
   }
   ```

    (Note: If you used `create-next-app` with the App router, this would be handled differently in `app/layout.js`).

### **Checkpoint 2:**
Run `npm run dev`. You should still see the Next.js homepage, but now it should have your `Header` and `Footer`.

## Phase 3: Migrating Pages & Data Fetching

This is the most critical phase. We will migrate each page and replace client-side data fetching with Next.js's server-side data fetching methods.

### Step 3.1: Migrate HomePage with Hybrid Data Fetching

The HomePage uses pagination with "Load More" functionality. We'll use a hybrid approach: initial posts via SSR, additional posts via client-side fetching.

**Action:**
1.  Copy the content of `frontend-ai-blog/src/pages/HomePage.js` into `frontend-nextjs/pages/index.js` (overwriting the existing file).
2.  **Update imports and routing hooks**:
   - Remove: `import { useNavigate } from "react-router-dom";`
   - Add: `import { useRouter } from 'next/router';`
   - Replace `const navigate = useNavigate();` with `const router = useRouter();`
   - Replace `navigate("/about")` with `router.push("/about")`
   - Replace `navigate("/curated")` with `router.push("/curated")`
3.  **Implement hybrid data fetching**:
   - Keep the existing pagination state and `handleLoadMore` logic
   - Modify the initial data fetching to use props from SSR
   - Update the component to accept initial posts as props:

    ```javascript
    import { getAllPosts } from '../utils/apiService';
    import { useRouter } from 'next/router';
    // ... other imports

    export default function HomePage({ initialPosts }) {
      const router = useRouter();
      const [posts, setPosts] = useState(initialPosts || []);
      const [loading, setLoading] = useState(false); // Changed from true since we have initial data
      // ... rest of your state

      // Remove the initial useEffect, keep only the pagination logic
      // ... rest of your component logic

      return (
        // ... your existing JSX
      );
    }

    export async function getServerSideProps() {
      try {
        const POSTS_PER_PAGE = 21;
        const initialPosts = await getAllPosts({
          limit: POSTS_PER_PAGE,
          offset: 0,
        });
        return { props: { initialPosts } };
      } catch (error) {
        console.error('Failed to fetch initial posts:', error);
        return { props: { initialPosts: [] } };
      }
    }
    ```

### **Checkpoint 3.1:**
Visit `http://localhost:3000`. Your homepage should now load, displaying the posts fetched from your API.

### Step 3.2: Migrate PostPage (Dynamic Route)

**Action:**
1.  Create a new file: `pages/post/[slug].js`. The square brackets indicate a dynamic route.
2.  Copy the content of `frontend-ai-blog/src/pages/PostPage.js` into this new file.
3.  **Update routing hooks**:
   - Remove: `import { useParams, useNavigate } from "react-router-dom";`
   - Add: `import { useRouter } from 'next/router';`
   - Replace `const { slug } = useParams();` with `const router = useRouter(); const { slug } = router.query;`
   - Replace `const navigate = useNavigate();` with router usage
   - Update the `goBack` function: `const goBack = () => { router.back(); };`
4.  **Remove client-side data fetching and add SSR**:
   - Remove the `useEffect` for fetching post data
   - Remove `loading` and `error` state related to data fetching
   - Update component to receive post as prop:

    ```javascript
    import { getPostBySlug } from '../../utils/apiService';
    import { useRouter } from 'next/router';

    export default function PostPage({ post, error }) {
      const router = useRouter();
      
      const goBack = () => {
        router.back();
      };

      if (error || !post) {
        return (
          // ... your existing error JSX
        );
      }

      // ... rest of your component logic with post data
    }

    export async function getServerSideProps(context) {
      const { slug } = context.params;
      
      try {
        const post = await getPostBySlug(slug);
        return { props: { post } };
      } catch (error) {
        console.error(`Failed to fetch post with slug ${slug}:`, error);
        return { 
          props: { 
            post: null, 
            error: 'Post not found' 
          } 
        };
      }
    }
    ```

### **Checkpoint 3.2:**
Navigate to a post URL like `http://localhost:3000/post/your-post-slug`. It should render the correct post.

### Step 3.3: Migrate Static & Other Pages

Follow the same pattern for the remaining pages, with special attention to the NewsPage's complex layout.

**Action:**
**AboutPage Migration (`pages/about.js`):**
- Copy `frontend-ai-blog/src/pages/AboutPage.js` to `pages/about.js`
- Update routing hooks: `useNavigate` → `useRouter` (same pattern as other pages)
- Replace navigation calls: `navigate(-1)` → `router.back()`, `navigate('/')` → `router.push('/')`
- **Important**: The page fetches markdown content from `/content/about.md` - this will work in Next.js since it's in the public directory
- Keep the existing useEffect for fetching markdown content (client-side is fine for this static content)
- Update SEO component imports to use Next.js Head

**CuratedPage Migration (`pages/curated.js`):**
- Copy `frontend-ai-blog/src/pages/CuratedPage.js` to `pages/curated.js`
- Update routing hooks: `useNavigate` → `useRouter` (same as HomePage)
- Remove `useEffect` and `useState` for initial data fetching
- **CRITICAL**: Preserve the specific filtering logic for curated posts:
  ```javascript
  export async function getServerSideProps() {
    try {
      const POSTS_PER_PAGE = 21;
      const posts = await getAllPosts({
        post_types: "curated",  // IMPORTANT: This filters for curated posts only
        sort_by: "published_date",
        limit: POSTS_PER_PAGE,
        offset: 0,
      });
      return { props: { initialPosts: posts } };
    } catch (error) {
      return { props: { initialPosts: [], error: 'Failed to load curated posts' } };
    }
  }
  ```
- Keep the existing pagination and "Load More" functionality (same hybrid approach as HomePage)

**NewsPage Migration (`pages/news.js`):**
- Copy `frontend-ai-blog/src/pages/NewsPage.js` to `pages/news.js`
- Remove React Router imports and add Next.js router
- Replace data fetching with SSR:
  ```javascript
  import { getNewsPosts } from '../utils/apiService';
  
  export async function getServerSideProps() {
    try {
      const NUM_POSTS_TO_FETCH = 12;
      const posts = await getNewsPosts({ limit: NUM_POSTS_TO_FETCH });
      return { props: { initialPosts: posts } };
    } catch (error) {
      return { props: { initialPosts: [], error: 'Failed to load news posts' } };
    }
  }
  ```
- Update any `Link` components to use Next.js routing

### Step 3.4: Create a Custom 404 Page

Improve the user experience for missing pages.

**Action:**
1.  Create a file `pages/404.js`.
2.  Copy the 404 JSX from your old `App.js` into this file to create your custom 404 page.

    ```javascript
    // pages/404.js
    export default function Custom404() {
      return (
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto bg-cyber-dark p-6 rounded-lg border border-cyber-pink relative">
             {/* ... your 404 content ... */}
             <h2 className="text-cyber-pink text-xl mb-4 font-cyber neon-text-pink">
               Page Not Found
             </h2>
             {/* ... etc ... */}
          </div>
        </div>
      )
    }
    ```

### **Checkpoint 3.3:**
Test all your routes (`/`, `/about`, `/curated`, `/news`, and a non-existent page to see your 404).

## Phase 4: Finalizing and Deployment

### Step 4.1: Review and Cleanup

**Critical cleanup tasks:**
1. **Remove unnecessary dependencies:**
   ```bash
   npm uninstall react-router-dom react-scripts
   ```
2. **Verify all routing conversions:**
   - Search for any remaining `react-router-dom` imports
   - Ensure all `<Link to="...">` are converted to `<Link href="...">`
   - Check that all `useNavigate()` are replaced with `useRouter()`
   - Verify `useLocation()` replacements with `useRouter()`
3. **Test all features:**
   - Navigation between pages
   - Post loading and rendering
   - Markdown processing with Mermaid diagrams
   - Load More pagination functionality
   - Cyberpunk theme styling
   - Newspaper theme on news page
   - 404 page handling
4. **Performance validation:**
   - Check that initial page loads are faster (SSR benefit)
   - Verify that cyberpunk animations and effects still work
   - Test mobile responsiveness

### Step 4.2: Enhanced SEO & PWA Setup (Optional but Recommended)

**Action:**
1. **SEO Enhancement:**
   Consider installing `next-seo` for better SEO management:
   ```bash
   npm install next-seo
   ```
   This provides more advanced SEO features than your current SEO component.

2. **PWA Manifest Handling:**
   Your current `manifest.json` should work in Next.js. Ensure it's linked in `_document.js`:
   ```javascript
   // Add to _document.js Head section
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#000000" />
   ```

3. **Favicon and Meta Tags:**
   Add the existing meta tags from your `index.html` to `_document.js`:
   ```javascript
   // Add to _document.js Head section
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   <meta name="keywords" content="AI, artificial intelligence, deep learning, machine learning, neural networks, research, blog, tech, technology, innovation, breakthroughs, insights, news, updates, LLMs, GenAI" />
   <link rel="icon" href="/logo.png" />
   ```

### Step 4.3: Production Environment Configuration

**Action:**
1. **Update environment variables for production:**
   - In your `.env.local`, set production API URL when deploying
   - Consider using different URLs for staging vs production
2. **Verify vercel.json configuration:**
   Your existing `vercel.json` should work, but ensure the API proxy points to the correct production backend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*", 
         "destination": "https://recursivai.onrender.com/:path*"
       }
     ]
   }
   ```

### Step 4.4: Deployment

Your project is already set up for Vercel deployment, which is perfect for Next.js.

**Action:**
1. **Update your existing monorepo:**
   From your project root (`AI-content-gen`):
   ```bash
   git add frontend-nextjs/
   git commit -m "Add Next.js frontend migration"
   git push
   ```

2. **Deploy to Vercel with monorepo setup:**
   - In your Vercel dashboard, go to your existing project settings
   - Update the "Root Directory" setting to `frontend-nextjs`
   - Set environment variable: `NEXT_PUBLIC_API_BASE_URL=https://recursivai.onrender.com`
   - Vercel will auto-detect Next.js and deploy with optimal settings
   
   Alternatively, you can create a new Vercel project specifically for the Next.js frontend:
   - Import your existing repository 
   - Set "Root Directory" to `frontend-nextjs`
   - Configure environment variables

3. **Test production deployment:**
   - Verify all pages load correctly
   - Test API calls work through the proxy
   - Check that fonts and styling render properly
   - Validate SEO meta tags

4. **Optional: Update your main project once tested:**
   After confirming everything works perfectly, you can:
   - Rename `frontend-ai-blog` to `frontend-ai-blog-old` (backup)
   - Rename `frontend-nextjs` to `frontend-ai-blog` 
   - Update any deployment configurations to use the new frontend

### **Final Verification Checklist:**
- [ ] All pages load without errors
- [ ] Cyberpunk theme renders correctly
- [ ] News page uses newspaper styling
- [ ] Posts load and display properly
- [ ] Pagination works
- [ ] Markdown with Mermaid diagrams renders
- [ ] Mobile responsive design intact
- [ ] API calls work in production
- [ ] SEO meta tags present
- [ ] Performance improved over CRA version

## Troubleshooting Common Issues

### Issue 1: Fonts Not Loading
**Problem**: Google Fonts or custom fonts don't render correctly.
**Solution**: Ensure all font imports from your `index.css` are properly copied to `globals.css`, and verify the font URLs are accessible.

### Issue 2: CSS Animations Broken
**Problem**: Cyberpunk animations and neon effects don't work.
**Solution**: 
- Verify all CSS custom properties and keyframe animations are copied
- Check that Tailwind's custom classes are properly defined
- Ensure `@tailwind` directives are at the top of your CSS file

### Issue 3: Markdown/Mermaid Not Rendering
**Problem**: Posts don't render markdown or Mermaid diagrams.
**Solution**:
- Verify all markdown processing dependencies are installed
- Check that `MarkdownRenderer` component is imported correctly
- Ensure unified processor configuration matches original

### Issue 4: API Calls Failing
**Problem**: Data fetching doesn't work in production.
**Solution**:
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check that your `vercel.json` proxy configuration is correct
- Ensure your backend allows CORS for the new domain

### Issue 5: Dynamic Routes 404
**Problem**: Post pages return 404 errors.
**Solution**:
- Verify the file is named `[slug].js` with square brackets
- Check that `getServerSideProps` is properly implemented
- Ensure the API endpoint returns valid data

## Estimated Timeline & Effort

**Total Estimated Time: 20-30 hours**
- **Phase 1** (Setup): 4-6 hours
- **Phase 2** (Components): 6-8 hours  
- **Phase 3** (Pages): 8-12 hours
- **Phase 4** (Deployment): 2-4 hours

**Complexity Level**: Moderate to High
- Your app has sophisticated features that require careful migration
- Multiple themes and complex styling need preservation
- Advanced markdown processing adds complexity

**Risk Level**: Low to Moderate
- Well-defined migration path
- Incremental approach allows for testing at each phase
- Existing codebase remains untouched during migration

**🎉 Migration Complete!** 

You have successfully migrated your sophisticated AI blog from Create React App to Next.js while preserving all features including the cyberpunk theme, dual layout system, advanced markdown processing, and client-side pagination.
