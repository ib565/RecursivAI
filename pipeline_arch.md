## Pipeline Components

### 1. Topic Discovery System
- **Pattern**: Single Tool Agent + Prompt Chain
- **Components**:
  - Web scraping/API integration (GitHub, arXiv, tech blogs)
  - Topic filtering pipeline
  - Ranking and selection system
- **Output**: 2-3 topics per day

### 2. Deeper Research
- **Pattern**: Tool Agent
- **Components**:
  - Literature review
  - Latest news
  - Codebase analysis
  - Data collection
- **Output**: Detailed research notes for article generation

### 2. Article Generation System
- **Pattern**: Orchestrator-Worker
- **Components**:
  - Orchestrator: Plans article structure and manages generation
  - Workers:
    - Text generation
    - Code generation
    - Image/visualization generation
- **Output**: Complete article draft with all components

### 3. Quality Control System
- **Pattern**: Evaluator-Optimizer
- **Components**:
  - Technical accuracy checker
  - Content quality evaluator
  - Feedback loop for improvements
- **Output**: Publication-ready article

## Data Flow

1. Topic Discovery → Topic Queue
2. Topic Queue → Article Generation
3. Draft → Quality Control
4. Quality Control → Publication or Regeneration