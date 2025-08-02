# Hi! Welcome to RecursivAI
RecursivAI is an AI-generated blog that keeps you up-to-date with the latest breakthroughs in the world of AI, explained in simple terms. It’s perfect for anyone who’s curious about AI but finds it tough to keep up.

**This is the only human-generated content on this platform.**

## The Goal
The world of AI moves so fast, it feels like only AI can keep up. That’s the idea behind **RecursivAI**! This blog is fully powered by AI to find the most important developments, break them down, and explain them in a way anyone can understand.

I also want this project to run itself as much as possible—smoothly, with almost no human intervention.

It’s still a work in progress, and I’ve got a lot of plans to improve it. Got any ideas or feedback? I’d love to hear from you! (Links below)

## Who it's for
I started this because I felt swamped by all the AI news and research. I wanted to stay on top of things but didn’t always have the time or skills to dig into dense papers and articles myself.

I made this blog for people like me, who are interested in AI but just can’t seem to keep up! **RecursivAI** takes the tricky stuff and makes it simple, while still keeping the core concepts intact.

## How it works
This project has two main components: a research pipeline and a news engine.

### Research Pipeline
The research pipeline is designed to go deep into the latest AI research papers and make them accessible to everyone.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'fontSize': '20px', 'lineColor': '#2563EB' }}}%%

flowchart TD
    %% Simple cyberpunk styling
    classDef default fill:#0D1117,stroke:#30A5DD,color:#fff
    classDef agent fill:#1A1A2E,stroke:#E83A82,color:#fff,stroke-width:2px
    classDef section fill:#172234,stroke:#30A5DD,color:#fff
    classDef property fill:#1E1E3A,stroke:#B73E8C,color:#fff,stroke-dasharray:3 2
    classDef output fill:#3B2864,stroke:#E83A82,color:#fff
    
    A[Paper Collection] --> B[Content Analysis]
    B --> C[**PlannerAgent**]
    C --> D[Outline]
    
    %% Multiple sections from outline
    D --> S1[Section 1]
    D --> S2[Section 2]
    D --> S3[Section 3]
    D --> S4[Section 4]
    
    %% Section properties components (shown only for Section 1)
    S1 -.-> |contains| T1[Type: Text/Diagram]
    S1 -.-> |contains| C1[Context]
    S1 -.-> |contains| I1[Instructions]
    S1 -.-> |contains| Q1[Research Queries]
    
    %% Research flow for Section 1
    Q1 -.-> WS[Web Search]
    WS -.-> EC1[Enhanced Context]
    
    %% Writer agents receiving sections
    S2 --> W2[WriterAgent 2]
    S3 --> W3[WriterAgent 3]
    S4 --> W4[WriterAgent 4]
    
    %% Properties flowing to Writer 1
    T1 --> W1[WriterAgent 1]
    C1 --> W1
    I1 --> W1
    EC1 --> W1
    
    %% Output from Writers
    W1 --> O1[Markdown Content]
    W2 --> O2[Mermaid Diagram]
    W3 --> O3[Markdown Content]
    W4 --> O4[Markdown Content]
    
    %% Compilation
    O1 --> F[Content Compilation]
    O2 --> F
    O3 --> F
    O4 --> F
    
    F --> G[Final Publication]
    
    %% Apply classes to nodes
    class C,W1,W2,W3,W4 agent
    class S1,S2,S3,S4 section
    class T1,C1,I1,Q1,EC1,WS property
    class O1,O2,O3,O4 output
    class G output
```

1. **Discovery and collection**
    - It searches for the latest AI research using the PapersWithCode API, picking papers with the highest number of GitHub stars. This was the simplest and most reliable way. Other sources (HackerNews, Reddit, RSS, Tavily Search) gave a lot of false positives, mixing in catchy headlines and fluff news.
2. **Analysis and Planning**
    - Extract the text from the paper and pass it to the **PlannerAgent**
    - PlannerAgent analyzes the text and generates a detailed outline, composed of specialized sections
    - Each section is either of type "text" or "diagram". It contains all necessary context from the paper, along with instructions for the **WriterAgent**
    - Each section is accompanied with a list of queries to fill in extra information not in the paper
3. **Research Enhancement**
    - **WriterAgents** use *Tavily* to execute the queries.
    - Response is added to the section context
4. **Content Generation**
    - **WriterAgents** process each section in parallel, according to the context and instructions
    - Text sections are transformed into a clear, easy-to-understand explanation
    - Diagram sections are converted to Mermaid diagrams
5. **Publication**
    - The sections are compiled into a coherent blog post
    - The post is automatically published to the blog

### News Engine
The news engine is designed for breadth and speed, capturing the daily pulse of the AI world.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'fontSize': '20px', 'lineColor': '#2563EB' }}}%%
flowchart TD
    classDef default       fill:#0D1117,stroke:#30A5DD,color:#fff
    classDef agent         fill:#1A1A2E,stroke:#E83A82,color:#fff,stroke-width:2px
    classDef section       fill:#172234,stroke:#30A5DD,color:#fff
    classDef property      fill:#1E1E3A,stroke:#B73E8C,color:#fff,stroke-dasharray:3 2
    classDef output        fill:#3B2864,stroke:#E83A82,color:#fff

    %% Data sources
    ds1[RSS Feeds]
    ds2[APIs]
    ds3[News Sites]
    ds4[Web Search]

    ds1 -.->|sources| A[Article Collection]
    ds2 -.->|sources| A
    ds3 -.->|sources| A
    ds4 -.->|sources| A

    %% Filtering & ranking
    A --> B[**CuratorAgent**]
    B --> E[Filtered & Ranked Articles]

    %% Detailed generation for Article 1
    E --> C1[**ContentAgent 1**]
    C1 --> HD1[Headline]
    C1 --> SB1[Subheading]
    C1 --> SM1[Summary]
    HD1 --> C2[**PromptAgent 1**]
    C2 --> P1[Image Prompt]
    P1 --> I1[**ImageGenAgent 1**]
    I1 --> IMG1[Featured Image]

    %% Merge Article 1 outputs
    HD1 --> A1[Article 1]
    SB1 --> A1
    SM1 --> A1
    IMG1 --> A1

    %% Parallel simplified for other articles
    E -- "content & image generation" --> A2[Article 2]
    E -- "content & image generation" --> A3[Article 3]
    E -- "content & image generation" --> A4[Article 4]

    %% Packaging & publication
    A1 --> Pack[Article Packaging]
    A2 --> Pack
    A3 --> Pack
    A4 --> Pack
    Pack --> Pub[Site Front Page Publication]

    class ds1,ds2,ds3,ds4,P1 property
    class A,A1,A2,A3,A4 section
    class B,C1,C2,I1 agent
    class E,HD1,SB1,SM1,IMG1,Pack,Pub output
```

1.  **Collection:** A scheduled job scrapes a curated list of RSS feeds, APIs, and news sources, and performs general web searches to find relevant articles from the last 24 hours.
2.  **Filtering & Ranking:** The collected articles are passed to an LLM which acts as a filter, removing noise and irrelevant content. It then ranks the remaining articles by significance (e.g., model releases, acquisitions, major breakthroughs).
3.  **Content Generation:** For each top-ranked article, a generative pipeline kicks in:
    *   An LLM generates a concise **headline, subheading, and summary**.
    *   A specialized prompt engineering model takes the headline and and creates a detailed, artistic prompt for an image generator.
    *   An image model uses this prompt to generate a high-quality, visually consistent **featured image**.
4.  **Publication:** The processed articles, complete with generated content and images, are published to the site's front page.


## Next Steps
Like I said, this project is still a work in progress. Here are some immediate plans:
- Better PDF parsing, extracting visual info
- Generation of more complex diagrams, different charts, etc.
- Generation of code snippets and eventually interactive demos
- A more agentic workflow, giving LLMs more control over the process
    - Examples: Editor Agent for iterative feedback, In depth research, etc. 

## Tech Stack
- Frontend: React, TailwindCSS
- Backend: FastAPI, Supabase
- LLM: Gemini
- Search: Tavily

I decided not to use any LLM frameworks for this project because I wanted more control over the workflow and didn't want to be distracted by abstractions.

## About Me
I'm Ishaan, a software engineer with an interest in AI.

I love exploring new ideas and experimenting, so if you have an interesting proposal, AI or otherwise, please reach out!

[LinkedIn](https://www.linkedin.com/in/ishaan-bhartiya/) | [GitHub](https://github.com/ib565) | [Email](mailto:ish.bhartiya@gmail.com) 
