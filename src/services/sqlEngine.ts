import alasql from "alasql";
import { Dataset } from "../types";

export interface SqlResult {
  success: boolean;
  rows?: Record<string, any>[];
  columns?: string[];
  rowCount?: number;
  executionMs: number;
  error?: string;
  query: string;
}

export class SqlEngine {
  private static registeredTable: string = "active_dataset";

  /**
   * Register dataset as an in-memory table for AlaSQL queries
   */
  static registerDataset(dataset: Dataset, tableName: string = "active_dataset") {
    this.registeredTable = tableName;
    // Register global in alasql
    try {
      alasql(`DROP TABLE IF EXISTS ${tableName}`);
    } catch {
      // ignore if doesn't exist
    }
    try {
      alasql(`CREATE TABLE ${tableName}`);
      alasql.tables[tableName].data = [...dataset.data];
    } catch (err) {
      console.warn("Table registration note:", err);
    }
  }

  /**
   * Validate SQL query safety: must be read-only analytical query
   */
  static validateQuery(sql: string): { safe: boolean; error?: string } {
    const trimmed = sql.trim();
    if (!trimmed) {
      return { safe: false, error: "Query is empty." };
    }

    // Check for multiple semicolon-delimited statements
    const statementCount = trimmed.split(";").filter((s) => s.trim().length > 0).length;
    if (statementCount > 1) {
      return {
        safe: false,
        error: "Security Check: Multiple statements are not permitted. Please submit a single read-only query.",
      };
    }

    // Prohibited commands
    const prohibited = ["DROP", "DELETE", "TRUNCATE", "ALTER", "INSERT", "UPDATE", "GRANT", "REVOKE", "EXEC", "EXECUTE", "INTO"];
    const upper = trimmed.toUpperCase();
    for (const kw of prohibited) {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      if (regex.test(upper)) {
        return {
          safe: false,
          error: `Security Check: Destructive or modifying keyword '${kw}' is prohibited. DataHarvest enforces strictly read-only analytical queries.`,
        };
      }
    }

    // Must start with SELECT or WITH
    const firstWord = upper.replace(/^\s+/, "").split(/\s+/)[0];
    if (firstWord !== "SELECT" && firstWord !== "WITH" && firstWord !== "SHOW") {
      return {
        safe: false,
        error: "Security Check: Query must be a read-only SELECT or WITH statement.",
      };
    }

    return { safe: true };
  }

  /**
   * Execute query on the active dataset table
   */
  static execute(sql: string, dataset?: Dataset): SqlResult {
    const start = performance.now();
    const validation = this.validateQuery(sql);
    if (!validation.safe) {
      return {
        success: false,
        error: validation.error,
        executionMs: Math.round(performance.now() - start),
        query: sql,
      };
    }

    if (dataset) {
      this.registerDataset(dataset, "active_dataset");
      this.registerDataset(dataset, "sales_demo");
      this.registerDataset(dataset, "dataset");
    }

    try {
      // Normalize common table names to active_dataset if user wrote FROM dataset or FROM sales
      const cleanSql = sql.replace(/;\s*$/, "");
      const res = alasql(cleanSql);

      const rows = Array.isArray(res) ? res : [res];
      const columns = rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null ? Object.keys(rows[0]) : [];
      const end = performance.now();

      return {
        success: true,
        rows,
        columns,
        rowCount: rows.length,
        executionMs: Math.round((end - start) * 10) / 10,
        query: sql,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to execute SQL query. Verify syntax and column names.",
        executionMs: Math.round(performance.now() - start),
        query: sql,
      };
    }
  }
}
