export interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  data: Record<string, any>[];
  fileSize: number;
  uploadedAt: string;
  fileType: 'csv' | 'xlsx' | 'xls';
  qualityScore: number;
  missingCells: number;
  duplicateRows: number;
  columnMetadata: ColumnMetadata[];
}

export interface ColumnMetadata {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
}

export interface AnalyticsKPIs {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number; // percentage
  averageOrderValue: number;
  totalTransactions: number;
  missingRate: number;
  duplicateCount: number;
  qualityScore: number;
  topProducts: { name: string; revenue: number; profit: number; quantity: number }[];
  categoryBreakdown: { category: string; revenue: number; profit: number; count: number }[];
  monthlyTrends: { month: string; revenue: number; profit: number; orders: number }[];
  regionalBreakdown: { region: string; revenue: number; count: number }[];
  channelBreakdown: { channel: string; revenue: number; count: number }[];
  outliers: { column: string; value: number; rowId: string | number; reason: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  latencyMs?: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  computedKPIs?: {
    label: string;
    value: string | number;
    change?: string;
    formula?: string;
  }[];
  chartConfig?: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    title: string;
    x: (string | number)[];
    y: number[];
    labels?: string[];
    values?: number[];
  };
  sqlDetails?: {
    sql: string;
    explanation: string;
    rowCount?: number;
  };
  ragCitations?: {
    title: string;
    relevance: number;
    snippet: string;
  }[];
  verificationNotes?: string;
}

export interface RagDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  uploadedAt: string;
  chunkCount: number;
  sourceType: 'system' | 'user';
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  durationMs?: number;
  recordsProcessed?: number;
  details?: string;
}

export interface QueryHistoryItem {
  id: string;
  sql: string;
  timestamp: string;
  executionMs: number;
  rowCount: number;
  status: 'success' | 'error';
  target: 'local_dataset' | 'snowflake';
}
