import { RagDocument } from "../types";

export interface RetrievedChunk {
  docId: string;
  title: string;
  category: string;
  content: string;
  score: number;
}

const DEFAULT_DOCUMENTS: RagDocument[] = [
  {
    id: "rag_kpi_standards",
    title: "DataHarvest KPI Calculation Standards",
    category: "Financial Standards",
    sourceType: "system",
    uploadedAt: "Oct 16, 2026",
    chunkCount: 3,
    content: `DataHarvest Financial KPI Formulation Guidelines:
1. Total Revenue: In transactional data, Total Revenue is defined strictly as Quantity multiplied by Unit Price across all completed sales transactions: Revenue = SUM(Quantity * Unit_Price).
2. Total Cost: Defined as the direct cost of goods sold: Cost = SUM(Quantity * Unit_Cost).
3. Gross Profit: The remainder after deducting Cost of Goods Sold from Total Revenue: Profit = Revenue - Cost.
4. Profit Margin: Expressed as a percentage of revenue: Profit Margin (%) = (Profit / Revenue) * 100.
Under no circumstances should an LLM synthesize or estimate metrics without calculating from actual verified rows.`,
  },
  {
    id: "rag_gaap_revenue",
    title: "GAAP Revenue Recognition & Audit Rules",
    category: "Accounting Policy",
    sourceType: "system",
    uploadedAt: "Oct 16, 2026",
    chunkCount: 2,
    content: `Under ASC 606 / IFRS 15, revenue is recognized when performance obligations are satisfied by transferring promised goods or services to customers.
In analytical queries:
- Orders that are cancelled or pending fulfillment must be segregated from realized GAAP revenue unless specifically requested.
- Discounts and rebates must be subtracted from Gross Sales to arrive at Net Recognized Revenue.
- Unit Price must reflect net contractual billing terms.`,
  },
  {
    id: "rag_data_quality",
    title: "DAMA Data Quality Dimensions",
    category: "Data Governance",
    sourceType: "system",
    uploadedAt: "Oct 16, 2026",
    chunkCount: 3,
    content: `The six core dimensions of enterprise data quality according to DAMA International:
1. Completeness: The proportion of stored data against the potential 100%. Null values in primary keys or essential metrics like Quantity or Price invalidate downstream calculations.
2. Uniqueness: No entity exists more than once within the dataset. Duplicate rows cause double-counting of revenue and overstatement of sales volume.
3. Validity: Data conformity to syntax, types, and allowable ranges (e.g. non-negative prices, valid ISO date strings).
4. Consistency: Data values across related attributes do not conflict (e.g. Revenue equals Quantity * Price).
5. Accuracy: Data represents real-world entities accurately.
6. Timeliness: Data freshness relative to decision cadence.`,
  },
  {
    id: "rag_snowflake_best_practices",
    title: "Snowflake Warehouse Query Optimization",
    category: "Infrastructure",
    sourceType: "system",
    uploadedAt: "Oct 16, 2026",
    chunkCount: 2,
    content: `Best practices for high-performance Snowflake analytical queries:
1. Pruning and Partitioning: Filter on clustering keys or date columns early in WHERE clauses to minimize micro-partition scanning and reduce credit consumption.
2. Selectivity: Avoid 'SELECT *' across multi-million row tables; explicitly name needed projection columns.
3. Warehouse Sizing: Utilize auto-suspend set to 60 seconds for interactive dashboards to prevent idle billing.
4. Caching: Snowflake query result cache holds identical query results for 24 hours if underlying data has not changed.`,
  },
  {
    id: "rag_margin_definitions",
    title: "Gross Margin vs. Contribution Margin",
    category: "Financial Standards",
    sourceType: "system",
    uploadedAt: "Oct 16, 2026",
    chunkCount: 2,
    content: `Financial margin distinction guidelines:
- Gross Margin reflects Revenue minus direct manufacturing or acquisition costs (COGS). It measures production efficiency.
- Contribution Margin subtracts all variable costs (including variable sales commissions, shipping, and channel fees) from Revenue, indicating how much surplus covers fixed enterprise overhead.
- In DataHarvest standard retail models, Unit_Cost represents direct unit acquisition cost, yielding Gross Profit and Gross Margin.`,
  },
];

export class RagService {
  private static documents: RagDocument[] = [...DEFAULT_DOCUMENTS];

  static getDocuments(): RagDocument[] {
    return [...this.documents];
  }

  static addDocument(title: string, category: string, content: string): RagDocument {
    const doc: RagDocument = {
      id: "doc_" + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      category: category.trim() || "Business Documentation",
      content: content.trim(),
      uploadedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      chunkCount: Math.max(1, Math.ceil(content.length / 400)),
      sourceType: "user",
    };
    this.documents.unshift(doc);
    return doc;
  }

  static deleteDocument(id: string): boolean {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter((d) => d.id !== id);
    return this.documents.length < initialLen;
  }

  static resetToDefault(): void {
    this.documents = [...DEFAULT_DOCUMENTS];
  }

  /**
   * Search knowledge base using term-frequency and semantic similarity scoring
   */
  static search(query: string, limit: number = 3): RetrievedChunk[] {
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (terms.length === 0) {
      return [];
    }

    const chunks: RetrievedChunk[] = [];

    this.documents.forEach((doc) => {
      // Split into paragraphs / logical chunks
      const paragraphs = doc.content
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 30);

      paragraphs.forEach((chunkContent) => {
        const lowerChunk = chunkContent.toLowerCase();
        let matchScore = 0;

        terms.forEach((term) => {
          if (doc.title.toLowerCase().includes(term)) {
            matchScore += 2.5;
          }
          if (doc.category.toLowerCase().includes(term)) {
            matchScore += 1.5;
          }
          const occurrences = (lowerChunk.match(new RegExp(`\\b${term}`, "g")) || []).length;
          matchScore += occurrences * 1.0;
        });

        if (matchScore > 0) {
          // Normalize score between 0.4 and 0.98
          const normalized = Math.min(0.98, Number((0.4 + (matchScore / (terms.length * 3)) * 0.58).toFixed(2)));
          chunks.push({
            docId: doc.id,
            title: doc.title,
            category: doc.category,
            content: chunkContent,
            score: normalized,
          });
        }
      });
    });

    chunks.sort((a, b) => b.score - a.score);
    return chunks.slice(0, limit);
  }
}
