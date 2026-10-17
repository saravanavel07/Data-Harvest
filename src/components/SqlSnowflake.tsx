import React, { useState } from "react";
import {
  Database,
  Play,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Server,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Dataset, QueryHistoryItem } from "../types";
import { SqlEngine, SqlResult } from "../services/sqlEngine";

interface SqlSnowflakeProps {
  activeDataset: Dataset | null;
  onQueryExecuted?: (item: QueryHistoryItem) => void;
}

export const SqlSnowflake: React.FC<SqlSnowflakeProps> = ({
  activeDataset,
  onQueryExecuted,
}) => {
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT \n  Category,\n  COUNT(*) AS Transaction_Count,\n  ROUND(SUM(Quantity * Unit_Price), 2) AS Total_Revenue,\n  ROUND(SUM(Quantity * (Unit_Price - Unit_Cost)), 2) AS Total_Profit\nFROM active_dataset\nGROUP BY Category\nORDER BY Total_Revenue DESC;"
  );
  const [nlPrompt, setNlPrompt] = useState("");
  const [queryResult, setQueryResult] = useState<SqlResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Snowflake connection state
  const [snowflakeConnected, setSnowflakeConnected] = useState(false);
  const [snowflakeLoading, setSnowflakeLoading] = useState(false);
  const [snowflakeInfo, setSnowflakeInfo] = useState<any>(null);

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = SqlEngine.execute(sqlQuery, activeDataset || undefined);
      setQueryResult(res);
      setIsExecuting(false);

      if (onQueryExecuted) {
        onQueryExecuted({
          id: "q_" + Date.now(),
          sql: sqlQuery,
          timestamp: new Date().toLocaleTimeString(),
          executionMs: res.executionMs,
          rowCount: res.rowCount || 0,
          status: res.success ? "success" : "error",
          target: "local_dataset",
        });
      }
    }, 50);
  };

  const handleGenerateSql = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const resp = await fetch("/api/gemini/sql-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: nlPrompt,
          schemaInfo: {
            tableName: "active_dataset",
            columns: activeDataset?.columns || [
              "Transaction_ID",
              "Date",
              "Product_Name",
              "Category",
              "Region",
              "Quantity",
              "Unit_Price",
              "Unit_Cost",
            ],
          },
          mode: "generate",
        }),
      });
      const data = await resp.json();
      if (data.sql) {
        setSqlQuery(data.sql);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestSnowflake = async () => {
    setSnowflakeLoading(true);
    try {
      const resp = await fetch("/api/snowflake/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await resp.json();
      setSnowflakeInfo(data);
      setSnowflakeConnected(data.connected);
    } catch (err) {
      console.error(err);
    } finally {
      setSnowflakeLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#103B29]">SQL Studio & Snowflake Integration</h1>
        <p className="text-xs text-[#657267] mt-1 leading-relaxed">
          Write analytical SQL, generate queries from natural language, and inspect Snowflake warehouse schemas with strict read-only safety validation.
        </p>
      </div>

      {/* Natural Language to SQL Assistant Bar */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#174D32] mb-2">
          <Sparkles className="w-4 h-4 text-[#72C84A]" />
          <span>Natural Language to SQL Generator</span>
        </div>
        <form onSubmit={handleGenerateSql} className="flex gap-2">
          <input
            type="text"
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g. 'Show total profit and units sold by region for hardware products'"
            className="flex-1 px-3.5 py-2 text-xs bg-[#FAFBF7] border border-[#DCE6DA] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#72C84A] text-[#202820]"
          />
          <button
            type="submit"
            disabled={isGenerating || !nlPrompt.trim()}
            className="px-4 py-2 bg-[#174D32] text-white text-xs font-semibold rounded-lg hover:bg-[#103B29] transition-colors disabled:opacity-50"
          >
            {isGenerating ? "Synthesizing..." : "Generate SQL"}
          </button>
        </form>
      </div>

      {/* SQL Editor & Execution Box */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl shadow-xs overflow-hidden">
        {/* Editor Toolbar */}
        <div className="px-4 py-2.5 bg-[#FAFBF7] border-b border-[#DCE6DA] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#174D32]">
            <Database className="w-4 h-4 text-[#26834A]" />
            <span>Interactive SQL Workspace</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#174D32] font-mono">
              In-Memory AlaSQL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="p-1.5 rounded-md text-xs text-[#657267] hover:text-[#174D32] hover:bg-[#E8F5E9] flex items-center gap-1 transition-colors"
              title="Copy query"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#26834A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleRunQuery}
              disabled={isExecuting}
              className="px-3.5 py-1.5 rounded-lg bg-[#26834A] text-white text-xs font-semibold hover:bg-[#174D32] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? "Executing..." : "Run Query"}</span>
            </button>
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="p-3 bg-[#0A261A]">
          <textarea
            rows={7}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-[#A5E86A] focus:outline-none resize-y leading-relaxed"
            placeholder="SELECT * FROM active_dataset LIMIT 20;"
          />
        </div>

        {/* Security Guardrail Notice */}
        <div className="px-4 py-2 bg-[#F4F8F1] border-t border-[#DCE6DA] flex items-center justify-between text-[11px] text-[#657267]">
          <div className="flex items-center gap-1.5 text-[#26834A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enforced read-only execution guardrails (DROP/DELETE/ALTER blocked).</span>
          </div>
          <span>Target Table: `active_dataset`</span>
        </div>
      </div>

      {/* Query Execution Results */}
      {queryResult && (
        <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE6DA] mb-3">
            <div className="flex items-center gap-2">
              {queryResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#26834A]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#C43D3D]" />
              )}
              <h3 className="text-xs font-bold text-[#103B29]">
                {queryResult.success ? `Query Successful (${queryResult.rowCount} rows)` : "Execution Failed"}
              </h3>
            </div>
            <span className="text-[11px] text-[#657267] font-mono tabular-nums">
              Execution: {queryResult.executionMs}ms
            </span>
          </div>

          {queryResult.success && queryResult.rows && queryResult.rows.length > 0 ? (
            <div className="overflow-x-auto border border-[#DCE6DA] rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F4F8F1] border-b border-[#DCE6DA] text-[#174D32]">
                    {queryResult.columns?.map((c) => (
                      <th key={c} className="py-2 px-3 font-semibold whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6DA]/50">
                  {queryResult.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#FAFBF7]">
                      {queryResult.columns?.map((c) => (
                        <td key={c} className="py-1.5 px-3 whitespace-nowrap text-[#202820] font-mono">
                          {typeof row[c] === "number" ? row[c].toLocaleString() : String(row[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : queryResult.success ? (
            <div className="text-xs text-[#657267] italic py-2">Query returned 0 rows.</div>
          ) : (
            <div className="p-3 rounded-lg bg-[#C43D3D]/10 border border-[#C43D3D]/20 text-xs text-[#C43D3D] font-mono">
              {queryResult.error}
            </div>
          )}
        </div>
      )}

      {/* Snowflake Warehouse Status & Schema Discovery */}
      <div className="bg-white border border-[#DCE6DA] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE6DA] mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#174D32]" />
            <h3 className="text-sm font-semibold text-[#174D32]">Snowflake Warehouse Connectivity</h3>
          </div>

          <button
            onClick={handleTestSnowflake}
            disabled={snowflakeLoading}
            className="px-3 py-1.5 rounded-lg border border-[#DCE6DA] bg-[#FAFBF7] hover:bg-[#E8F5E9] text-xs font-medium text-[#174D32] transition-colors"
          >
            {snowflakeLoading ? "Testing..." : "Test Connection & Discover Schemas"}
          </button>
        </div>

        {snowflakeInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA]">
                <div className="text-[10px] text-[#657267]">Cluster Account</div>
                <div className="font-semibold text-[#103B29] truncate">{snowflakeInfo.account}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA]">
                <div className="text-[10px] text-[#657267]">Warehouse</div>
                <div className="font-semibold text-[#103B29] truncate">{snowflakeInfo.warehouse}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA]">
                <div className="text-[10px] text-[#657267]">Database</div>
                <div className="font-semibold text-[#103B29] truncate">{snowflakeInfo.database}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA]">
                <div className="text-[10px] text-[#657267]">Mode</div>
                <div className="font-semibold text-[#26834A] capitalize">{snowflakeInfo.mode.replace("_", " ")}</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-[#174D32] mb-2">Discovered Remote Tables:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {snowflakeInfo.tables?.map((tbl: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#FAFBF7] border border-[#DCE6DA] text-xs">
                    <div className="font-semibold text-[#103B29] truncate">{tbl.name}</div>
                    <div className="text-[11px] text-[#657267] mt-0.5">
                      {tbl.rowCount.toLocaleString()} rows · {tbl.sizeMb} MB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#657267]">
            Connect to enterprise Snowflake clusters or test immediately using our pre-built Snowflake Local Sandbox.
          </p>
        )}
      </div>
    </div>
  );
};
