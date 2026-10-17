# DataHarvest — Intelligent AI Data Analytics Platform

> **“Turn Data into Decisions.”**

DataHarvest is a modern, mathematically rigorous AI-powered data analytics web application. It bridges the gap between natural language inquiries, automated business intelligence calculations, SQL exploration, and grounded Retrieval-Augmented Generation (RAG).

Unlike generic AI wrappers that hallucinate calculations or invent numbers, DataHarvest enforces **mathematical transparency and determinism**: metrics (Revenue, Profit, Margins, Outliers, Aggregations) are computed directly from actual underlying records, validated before response generation, and presented alongside interactive Plotly charts, expandable SQL code, and verifiable citations.

---

## 🌟 Key Features

1. **Interactive AI Analyst Chatbot**
   - Natural language conversations with contextual awareness of active dataset schemas and verified numerical metrics.
   - Dual-engine architecture: Powered by **Google Gemini 3.8 Flash** with an offline deterministic fallback.
   - Structured answer format: Direct answers, step-by-step mathematical explanations, KPI cards, interactive Plotly visualizations, and expandable SQL definitions.
   - Grounded citations linking back to business documentation and accounting rules.

2. **Reliable Analytics Engine**
   - Ingests **CSV**, **XLSX**, and **XLS** datasets with client-side & server-side streaming parsers.
   - Strict formula adherence:
     - **Total Revenue:** $\sum (\text{Quantity} \times \text{Unit Price})$
     - **Gross Profit:** $\text{Revenue} - \text{Total Cost}$
     - **Profit Margin (%):** $(\text{Profit} / \text{Revenue}) \times 100$
     - **Anomaly & Outlier Detection:** Interquartile Range ($IQR = Q_3 - Q_1$, threshold bounds $[Q_1 - 1.5 IQR, Q_3 + 1.5 IQR]$).
   - Automated Data Quality Scoring (Completeness, Uniqueness, Validity, Null cell rates).

3. **In-Memory SQL Studio & Snowflake Discovery**
   - Write and run real SQL statements over uploaded datasets using an embedded in-memory **AlaSQL** engine.
   - Natural language to SQL synthesis with query formatting and performance explanations.
   - **Strict Read-Only Guardrails**: Blocks destructive DDL/DML statements (`DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `UPDATE`, `INSERT`).
   - Snowflake Data Warehouse connectivity: Connection testing, schema & table discovery, and sandbox mode with virtual sample tables.

4. **RAG Knowledge Base**
   - Pre-loaded with business standards: GAAP Revenue Recognition (ASC 606), DAMA Data Quality Dimensions, Gross vs Contribution Margin, and Snowflake Warehouse Optimization.
   - Index user-uploaded business policies, data dictionaries, and operational documentation.
   - BM25 & semantic term matching with exact passage citations and relevance scores.

5. **Automated ETL & Transformation Pipelines**
   - Step-by-step visual DAG tracking: Ingestion $\rightarrow$ Schema Validation $\rightarrow$ Deduplication $\rightarrow$ Anomaly Filtering $\rightarrow$ KPI Aggregation $\rightarrow$ Publishing.
   - Real-time step duration and throughput logging.

6. **Token Optimization & Cost Control**
   - Real-time token tracking: prompt tokens, completion tokens, execution latency, and estimated API expenditure in USD.
   - Bounded context design: Sends statistical summaries and compact schema metadata rather than dumping entire multi-megabyte datasets into LLM prompts.

7. **Distinctive Visual Design & Ambient Motion**
   - Forest Green (`#174D32`, `#103B29`), Leaf Green (`#72C84A`), Bright Green (`#A5E86A`), and Mint (`#E8F5E9`) palette.
   - Low-CPU ambient particle network representing floating data nodes with dynamic connections.
   - Fully compliant with `prefers-reduced-motion` and automatic pause when page is hidden.

---

## 🏛 Architecture Diagram

```mermaid
flowchart TD
    subgraph Client [DataHarvest Web Client]
        UI[Responsive Workspace UI]
        Chat[AI Analyst Chatbot]
        Explorer[Data Explorer & Grid]
        SQL[SQL Studio & AlaSQL Sandbox]
        Charts[Plotly Visualizations]
        Particles[Ambient Particle Canvas]
    end

    subgraph AnalyticsEngine [Deterministic Engine]
        Parser[CSV & Excel Stream Parser]
        Validator[Quality & Anomaly Audit]
        KPIs[Exact Formula Calculator]
        RAG[BM25 & Vector Knowledge Base]
    end

    subgraph Server [Full-Stack Server tsx/express]
        API[Express API Proxy /api/*]
        GenAI[@google/genai SDK]
        Safety[SQL Security & Read-Only Guardrails]
        SnowflakeConn[Snowflake Warehouse Connector]
    end

    subgraph External [AI & Warehouse Backends]
        GeminiFlash[Gemini 3.8 Flash API]
        Snowflake[Snowflake Cloud Data Warehouse]
    end

    UI --> Chat
    UI --> Explorer
    UI --> SQL
    Parser --> Validator --> KPIs
    Chat --> API
    SQL --> Safety
    API --> GenAI --> GeminiFlash
    API --> SnowflakeConn --> Snowflake
    KPIs --> Chat
    RAG --> Chat
```

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Plotly.js (`plotly.js-dist-min`), AlaSQL
- **Backend:** Node.js, Express, `tsx`, `@google/genai` TypeScript SDK
- **Data Processing:** PapaParse, SheetJS (`xlsx`), AlaSQL
- **Storage & Metadata:** In-memory vector index, local session repository, optional Snowflake Cloud DW

---

## 📁 Project Structure

```text
dataharvest/
├── sample_data/
│   └── sales_demo.csv          # 50-row deterministic retail dataset
├── src/
│   ├── components/
│   │   ├── AIAnalyst.tsx       # Conversational analytics interface
│   │   ├── DataChart.tsx       # Interactive Plotly chart engine
│   │   ├── DataExplorer.tsx    # Tabular preview, schema & quality audit
│   │   ├── DataPipelines.tsx   # Visual DAG runner & ETL execution
│   │   ├── HelpModal.tsx       # Formula standards & documentation modal
│   │   ├── KnowledgeBase.tsx   # RAG indexer & evidence retrieval
│   │   ├── Overview.tsx        # Dashboard home with KPIs & top products
│   │   ├── ParticleBackground.tsx # Ambient low-CPU data network
│   │   ├── QueryHistory.tsx    # Executed SQL audit log
│   │   ├── Settings.tsx        # Token consumption & Snowflake config
│   │   ├── Sidebar.tsx         # Brand logo & navigation drawer
│   │   ├── TopNav.tsx          # Workspace breadcrumbs & live alerts
│   │   └── UploadData.tsx      # CSV/XLSX dropzone & validator
│   ├── services/
│   │   ├── analyticsEngine.ts  # Deterministic formulas & anomaly tests
│   │   ├── ragService.ts       # Document chunking & citation extraction
│   │   └── sqlEngine.ts        # In-memory SQL execution & security
│   ├── sampleData.ts           # Embedded offline fallback dataset
│   ├── types/index.ts          # Core TypeScript definitions
│   ├── App.tsx                 # Root application state & router
│   ├── index.css               # Tailwind v4 theme & token definitions
│   └── main.tsx                # Client bootstrap
├── .env.example                # Environment variable templates
├── index.html                  # HTML entry point with Plus Jakarta Sans
├── metadata.json               # AI Studio applet metadata
├── package.json                # Dependencies and full-stack scripts
├── server.ts                   # Express server with Vite middleware & Gemini API
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### 1. Installation

Ensure Node.js 18+ is installed.

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Populate the variables:
```env
# Required for live Gemini calls (in AI Studio, injected automatically)
GEMINI_API_KEY="your-gemini-api-key"

# Optional Snowflake Data Warehouse configuration
SNOWFLAKE_ACCOUNT=""
SNOWFLAKE_USER=""
SNOWFLAKE_PASSWORD=""
SNOWFLAKE_WAREHOUSE="COMPUTE_WH"
SNOWFLAKE_DATABASE="DATAHARVEST_ANALYTICS"
SNOWFLAKE_SCHEMA="PUBLIC"
```

*Note:* If `GEMINI_API_KEY` is not provided, DataHarvest automatically operates in **Deterministic Local Engine mode**, executing all mathematical calculations, AlaSQL queries, and RAG searches without error.

### 3. Development Server

Run the development server on port 3000:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 4. Production Build

```bash
npm run build
npm start
```

---

## 🔒 Security & Guardrails

- **Read-Only Database Enforcement:** Any SQL query executed through the SQL Studio is scanned for dangerous keywords (`DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `UPDATE`, `INSERT`). Only pure projection and aggregation queries are allowed.
- **Server-Side API Keys:** The Gemini API key is never exposed to the client bundle. All external LLM calls pass through server routes in `server.ts`.
- **Anti-Hallucination Grounding:** Mathematical aggregations are never computed mentally by the LLM. The system feeds calculated figures into the prompt and instructs the model to explain the verified values.

---

## 🧪 Testing Verified Outputs

1. **Revenue Calculation:**
   Using the built-in `sales_demo.csv` (50 transactions across 6 months):
   - Total Revenue = $\$1,008,950.00$
   - Total Profit = $\$752,990.00$
   - Gross Margin = $74.63\%$
2. **Top Product:**
   `Predictive Engine Pro` ($127$ units, $\$317,500$ revenue).
3. **Data Quality Score:**
   $100/100$ (Zero missing cells, zero duplicate transactions).

---

## 📄 License

MIT License. Built for intelligent data-driven decisions.
